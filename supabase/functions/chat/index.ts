import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY")
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API Key Gemini (GEMINI_API_KEY) tidak ditemukan di server backend." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { messages, portfolioContext } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Permintaan tidak valid: riwayat percakapan tidak ditemukan." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Map frontend messages into Gemini contents payload format
    const contents = messages.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    // Construct the System Instructions with the portfolio state context
    const systemInstructionText = `Anda adalah AlphaShield Quant Copilot — asisten analisis portofolio berbasis data makro Indonesia. Berikan jawaban:
- Dalam Bahasa Indonesia yang jelas dan natural
- Sertakan angka spesifik dari konteks portofolio
- Referensikan kondisi makro aktual
- Jawab pertanyaan umum keuangan dengan konteks Indonesia
- Selalu tambahkan disclaimer singkat jika memberi rekomendasi investasi
- Format jawaban dengan paragraf bersih, gunakan bullet points jika perlu

KONTEKS PORTOFOLIO SAAT INI:
${portfolioContext || 'Tidak ada konteks portofolio.'}`

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: {
          parts: [{ text: systemInstructionText }]
        }
      })
    })

    // Handle Gemini response errors (such as 429 rate limits)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Gemini API Error]', errorText)

      let clientMsg = "Koneksi ke jaringan AlphaShield terputus. Silakan coba beberapa saat lagi."
      if (response.status === 429) {
        clientMsg = "Terlalu banyak permintaan (Rate Limit), coba lagi beberapa saat."
      } else if (response.status === 403 || response.status === 401) {
        clientMsg = "API Key Gemini tidak valid atau tidak memiliki otorisasi."
      }

      return new Response(
        JSON.stringify({ error: clientMsg }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resultJson = await response.json()
    const replyText = resultJson.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return new Response(
      JSON.stringify({ text: replyText }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Edge Function Error]', error)
    return new Response(
      JSON.stringify({ error: "Gagal memproses obrolan. Silakan coba beberapa saat lagi." }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
