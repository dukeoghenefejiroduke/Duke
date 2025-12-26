// src/services/ai.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";

const genAI = new GoogleGenerativeAI("AIzaSyBKQ07Jd8dNw-cfwQ_JQDL15TrjBx6RHeE");
export const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are JARVIS, Tony Stark's intelligent, sarcastic AI assistant. Respond concisely, with subtle humor. Use "sir" occasionally.`,
});

export const askAI = async (query) => {
  try {
    const result = await model.generateContent(query);
    return result.response.text();
  } catch {
    return "I'm having trouble connecting to my higher functions, sir.";
  }
};