import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const twelvedataKey = Deno.env.get("TWELVEDATA_API_KEY")
    if (!twelvedataKey) {
      return new Response(
        JSON.stringify({ error: "TWELVEDATA_API_KEY environment variable is not set." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Twelve Data endpoint to retrieve current price for multiple tickers
    const symbols = 'USD/IDR,XAU/USD'
    const twelvedataUrl = `https://api.twelvedata.com/price?symbol=${symbols}&apikey=${twelvedataKey}`
    
    const response = await fetch(twelvedataUrl)
    if (!response.ok) {
      throw new Error(`Twelve Data API returned status ${response.status}`)
    }

    const data = await response.json()
    console.log('[Twelve Data Batch Price Data]', data)

    const symbolToMetric: Record<string, string> = {
      'USD/IDR': 'usd_idr',
      'XAU/USD': 'gold_usd'
    }

    const results: Record<string, { status: string; value?: number; error?: string }> = {}
    const updates: any[] = []

    // If Twelve Data returned a global error, record it for all symbols instead of throwing
    if (data.status === 'error') {
      console.error('[refresh-macro] Twelve Data global error:', data.message)
      for (const symbol of Object.keys(symbolToMetric)) {
        results[symbol] = { status: 'failed', error: data.message || 'Twelve Data global request error' }
      }
    } else {
      for (const [symbol, metric] of Object.entries(symbolToMetric)) {
        try {
          const symbolData = data[symbol]
          if (!symbolData) {
            throw new Error(`No data returned for symbol: ${symbol}`)
          }
          if (symbolData.status === 'error') {
            throw new Error(symbolData.message || 'Error fetching symbol price')
          }

          const priceStr = symbolData.price
          if (!priceStr) {
            throw new Error(`Price field is missing for symbol: ${symbol}`)
          }

          const priceVal = parseFloat(priceStr)
          if (isNaN(priceVal)) {
            throw new Error(`Invalid numeric price: ${priceStr}`)
          }

          results[symbol] = { status: 'success', value: priceVal }
          updates.push({
            metric: metric,
            value: priceVal,
            updated_at: new Date().toISOString()
          })
        } catch (err) {
          console.error(`[refresh-macro] Failed to process symbol ${symbol}:`, err)
          results[symbol] = { status: 'failed', error: err.message }
        }
      }
    }

    // Perform database upsert only for the successfully fetched ticker prices
    if (updates.length > 0) {
      const { error: dbError } = await supabase
        .from('macro_data')
        .upsert(updates, { onConflict: 'metric' })

      if (dbError) {
        throw dbError
      }
    }

    return new Response(
      JSON.stringify({
        message: "Macro data refresh process completed.",
        results: results,
        upsertedCount: updates.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[refresh-macro Error]', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
