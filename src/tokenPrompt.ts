import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({ apiKey:"AIzaSyCm-_oseO2HwlI_RUiCFHVDHUGcEA_maK0"});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Give the name,symbol,address,decimals of the token  on solana in key value format",
  });
  console.log(response.text);
}

main();