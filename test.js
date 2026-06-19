require('dotenv').config({ path: './backend/.env' });
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.models.generateContent({ model: 'gemini-1.5-flash', contents: 'Hello' })
  .then(r => console.log(r.text))
  .catch(console.error);
