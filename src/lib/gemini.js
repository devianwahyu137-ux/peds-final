import { buildPortfolioContext } from './portfolioContextBuilder';

export async function getAlphaShieldAnalysis(userMessage, portfolioState, chatHistory = [], onChunk = null) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Konfigurasi koneksi database backend (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) tidak lengkap.');
  }

  try {
    const portfolioContext = buildPortfolioContext(portfolioState);
    
    const cleanHistory = [];
    let expectedRole = 'user';
    
    // Build perfectly alternating history
    chatHistory.forEach(msg => {
      if (msg.role === 'system') return; // Ignore system messages
      
      const mappedRole = (msg.role === 'model' || msg.role === 'assistant' || msg.role === 'ai') ? 'model' : 'user';
      if (mappedRole === expectedRole) {
        cleanHistory.push({ role: mappedRole, content: msg.text || msg.content || '' });
        expectedRole = expectedRole === 'user' ? 'model' : 'user';
      }
    });
    
    // Gemini crashes if the history array ends with 'user' because the incoming prompt is also 'user'.
    if (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role === 'user') {
      cleanHistory.pop(); 
    }

    // Append the new incoming user message to the end of history
    cleanHistory.push({ role: 'user', content: userMessage });
    
    console.log("[AlphaShield] Forwarding history to Edge Function:", cleanHistory);

    // Call the Supabase Edge Function proxy
    const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        messages: cleanHistory,
        portfolioContext: portfolioContext,
      }),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.error || `Server responded with status ${response.status}`);
    }

    const resultData = await response.json();
    const replyText = resultData.text || '';

    // Trigger chunk callback at least once for UI compatibility
    if (onChunk) {
      onChunk(replyText, replyText);
    }

    return replyText;
  } catch (error) {
    console.error('[AlphaShield] Chat Proxy Error:', error);
    
    // If the error message comes from the backend proxy, propagate it directly.
    const isFriendlyError = error.message && (
      error.message.includes("Terlalu banyak permintaan") ||
      error.message.includes("API Key Gemini") ||
      error.message.includes("tidak ditemukan") ||
      error.message.includes("tidak valid")
    );
    
    throw new Error(isFriendlyError ? error.message : "Koneksi ke jaringan AlphaShield terputus. Silakan coba beberapa saat lagi.");
  }
}
