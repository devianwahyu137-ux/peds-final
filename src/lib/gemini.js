import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildPortfolioContext } from './portfolioContextBuilder';

// Initialize the Gemini client using Vite environment variable
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export async function getAlphaShieldAnalysis(userMessage, portfolioState, chatHistory = [], onChunk = null) {
  if (!apiKey) {
    throw new Error('API Key Gemini (VITE_GEMINI_API_KEY) tidak ditemukan di environment.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const portfolioContext = buildPortfolioContext(portfolioState);
    
    const systemInstruction = `Anda adalah AlphaShield Quant Copilot — asisten analisis portofolio berbasis data makro Indonesia. Berikan jawaban:
- Dalam Bahasa Indonesia yang jelas dan natural
- Sertakan angka spesifik dari konteks portofolio
- Referensikan kondisi makro aktual
- Jawab pertanyaan umum keuangan dengan konteks Indonesia
- Selalu tambahkan disclaimer singkat jika memberi rekomendasi investasi
- Format jawaban dengan paragraf bersih, gunakan bullet points jika perlu

KONTEKS PORTOFOLIO SAAT INI:
${portfolioContext}`;

    // Instantiate the model using gemini-1.5-flash-latest
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      systemInstruction: systemInstruction,
    });

    const cleanHistory = [];
    let expectedRole = 'user';
    
    // Build perfectly alternating history
    chatHistory.forEach(msg => {
      if (msg.role === 'system') return; // Ignore system messages
      
      const mappedRole = (msg.role === 'model' || msg.role === 'assistant' || msg.role === 'ai') ? 'model' : 'user';
      if (mappedRole === expectedRole) {
        cleanHistory.push({ role: mappedRole, parts: [{ text: msg.text || msg.content || '' }] });
        expectedRole = expectedRole === 'user' ? 'model' : 'user';
      }
    });
    
    // Gemini crashes if the history array ends with 'user' because the incoming prompt is also 'user'.
    if (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role === 'user') {
      cleanHistory.pop(); 
    }
    
    // Add debugging log
    console.log("[AlphaShield] Sanitized History for Gemini:", cleanHistory);

    // Start a chat session with strictly formatted history
    const chat = model.startChat({
      history: cleanHistory,
    });

    // Send the new message using stream if callback is provided
    if (onChunk) {
      const result = await chat.sendMessageStream(userMessage);
      let fullText = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        onChunk(chunkText, fullText);
      }
      return fullText;
    } else {
      const result = await chat.sendMessage(userMessage);
      return result.response.text();
    }
  } catch (error) {
    console.error('[AlphaShield] Gemini API Error:', error);
    throw new Error("Koneksi ke jaringan AlphaShield terputus. Silakan coba beberapa saat lagi.");
  }
}
