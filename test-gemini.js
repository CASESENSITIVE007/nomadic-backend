import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';
// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({apiKey: process.env.Gemini_api_key});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", 
    contents: "Give me the roadmap to learn the implementation ai i am a web developer",
  });
  console.log(response.text);
}

main();