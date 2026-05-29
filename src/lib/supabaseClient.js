// src/lib/supabaseClient.js
// Supabase client singleton — imported once, reused everywhere

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[AlphaShield] Supabase env vars missing. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  );
}

const isPlaceholder = !SUPABASE_URL || SUPABASE_URL.includes('placeholder');

// Provide a mock client if credentials are missing so the app doesn't crash
export const supabase = isPlaceholder 
  ? {
      from: () => ({
        select: () => ({
          order: () => ({
            limit: async () => ({ data: [], error: null })
          })
        })
      }),
      channel: () => ({
        on: () => ({
          subscribe: () => {}
        })
      }),
      removeChannel: () => {}
    }
  : createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        realtime: {
          params: { eventsPerSecond: 2 },
        },
      }
    );

// Key mapping: Supabase column key → AlphaShield store key
export const SUPABASE_KEY_MAP = {
  bi_rate:  'bi_macro',
  cpi:      'bi_macro',   // same store key, merged
  usd_idr:  'usdIdr',
  dxy:      'dxy',
  gs10:     'gs10',
  ihsg:     'ihsg',
  sbn_10y:  'sbn_yields',
};
