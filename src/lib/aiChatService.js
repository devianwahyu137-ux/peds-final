// src/lib/aiChatService.js
// Real AI API call — Anthropic claude-haiku-4-5 → GPT-4o-mini fallback
// Reads keys from import.meta.env — never hardcoded

import { buildPortfolioContext } from './portfolioContextBuilder';

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const OPENAI_KEY    = import.meta.env.VITE_OPENAI_API_KEY;

/**
 * sendChatMessage
 * Sends user message to real AI API with full portfolio context.
 *
 * @param {{role:string,content:string}[]} history - conversation history
 * @param {string}   userMsg        - new user message
 * @param {object}   portfolioState - { scenarioId, weights, analytics, macroInputs, liveData }
 * @param {Function} onChunk        - called with each streamed text chunk
 * @returns {Promise<string>}       - full response text
 */
export async function sendChatMessage(
  history,
  userMsg,
  portfolioState,
  onChunk = () => {}
) {
  const systemPrompt = buildPortfolioContext(portfolioState) + `\n
KARAKTER & INSTRUKSI PENTING:
Kamu adalah AlphaShield Quant Copilot — asisten analisis portofolio
berbasis data makro Indonesia. Berikan jawaban:
- Dalam Bahasa Indonesia yang jelas dan natural
- Sertakan angka spesifik dari konteks portofolio di atas
- Referensikan kondisi makro aktual (BI Rate, IDR, dll)
- Jawab pertanyaan umum keuangan dengan konteks Indonesia
- Selalu tambahkan disclaimer singkat jika memberi rekomendasi investasi
- Format jawaban dengan paragraf bersih, gunakan bullet points jika perlu
- Jika tidak relevan dengan portofolio, tetap jawab dengan bijak
- Maksimal 300 kata per respons kecuali diminta lebih panjang`;

  // Try Anthropic first
  if (ANTHROPIC_KEY) {
    return await callAnthropic(systemPrompt, history, userMsg, onChunk);
  }

  // Fallback to OpenAI
  if (OPENAI_KEY) {
    return await callOpenAI(systemPrompt, history, userMsg, onChunk);
  }

  // No streaming API key available — signal caller to use Gemini fallback
  throw new Error('NO_STREAMING_KEY');
}

/**
 * hasStreamingKey
 * Quick check whether a streaming-capable API key is configured.
 */
export function hasStreamingKey() {
  return !!(ANTHROPIC_KEY || OPENAI_KEY);
}

// ── ANTHROPIC ─────────────────────────────────────────────────
async function callAnthropic(systemPrompt, history, userMsg, onChunk) {
  const messages = [
    ...history.map(m => ({
      role: m.role === 'ai' ? 'assistant' : m.role,
      content: m.content,
    })),
    { role: 'user', content: userMsg },
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':            'application/json',
      'x-api-key':               ANTHROPIC_KEY,
      'anthropic-version':       '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5',
      max_tokens: 800,
      system:     systemPrompt,
      messages,
      stream:     true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${err}`);
  }

  return await readSSEStream(response, onChunk, 'anthropic');
}

// ── OPENAI ────────────────────────────────────────────────────
async function callOpenAI(systemPrompt, history, userMsg, onChunk) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({
      role: m.role === 'ai' ? 'assistant' : m.role,
      content: m.content,
    })),
    { role: 'user', content: userMsg },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model:       'gpt-4o-mini',
      messages,
      max_tokens:  800,
      temperature: 0.7,
      stream:      true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  return await readSSEStream(response, onChunk, 'openai');
}

// ── SSE STREAM READER ─────────────────────────────────────────
async function readSSEStream(response, onChunk, provider = 'anthropic') {
  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let   full    = '';
  let   buffer  = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    // Keep incomplete last line in buffer
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      const data = trimmed.slice(6).trim();
      if (data === '[DONE]') continue;

      try {
        const json = JSON.parse(data);
        let text = '';

        if (provider === 'anthropic') {
          text = json.delta?.text ?? '';
        } else {
          text = json.choices?.[0]?.delta?.content ?? '';
        }

        if (text) {
          full += text;
          onChunk(text);
        }
      } catch {
        // Ignore malformed JSON chunks
      }
    }
  }

  return full;
}
