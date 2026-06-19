require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    // Real 1x1 transparent GIF base64
    const realB64 = 'R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    const imagePart = {
      inlineData: {
        data: realB64,
        mimeType: 'image/gif',
      },
    };
    const prompt = 'What is this image?';
    const response = await ai.models.generateContent({ 
      model: 'gemini-2.5-flash', 
      contents: [prompt, imagePart] 
    });
    console.log("Output:", response.text);
  } catch (err) {
    console.error(err);
  }
}
run();
