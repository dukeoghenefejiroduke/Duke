import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyBKQ07Jd8dNw-cfwQ_JQDL15TrjBx6RHeE");

export async function askAI(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const res = await model.generateContent(prompt);
  return res.response.text();
}
