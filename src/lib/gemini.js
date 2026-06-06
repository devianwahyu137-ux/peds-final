import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function getAlphaShieldAnalysis(userMessage, marketData, chatHistory = []) {
  try {
    const systemInstruction = `Anda adalah analis kuantitatif utama di AlphaShield. Jawablah dengan gaya profesional, ringkas, dan berbasis metrik (Dark Finance aesthetic).
KONTEKS DATA PASAR REAL-TIME:
- BI Rate: ${marketData?.macro?.biRate || 'N/A'}%
- Inflasi: ${marketData?.macro?.inflation || 'N/A'}%
- USD/IDR: ${marketData?.macro?.usdIdr || 'N/A'}
- DXY Index: ${marketData?.macro?.dxy || 'N/A'}
- IHSG: ${marketData?.equities?.ihsg || 'N/A'}

Gunakan data di atas sebagai landasan absolut untuk merespons pertanyaan pengguna. Jangan berasumsi, gunakan angka aktual.`;

    // Instantiate the model using gemini-1.5-flash
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction,
    });

    // Format chat history for Gemini API
    let formattedHistory = chatHistory.map((msg) => ({
      role: msg.role === 'model' || msg.role === 'assistant' || msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content || msg.text || '' }],
    }));

    // Strict Sanitization: Gemini requires history to either be empty or start with 'user'
    const firstUserIndex = formattedHistory.findIndex(msg => msg.role === 'user');
    if (firstUserIndex === -1) {
      formattedHistory = [];
    } else {
      formattedHistory = formattedHistory.slice(firstUserIndex);
    }

    // Start a chat session with strictly formatted history
    const chat = model.startChat({
      history: formattedHistory,
    });

    // Send the new message
    const result = await chat.sendMessage(userMessage);
    
    return result.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    return "Koneksi ke jaringan AlphaShield terputus. Silakan coba beberapa saat lagi.";
  }
}
