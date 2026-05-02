import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getAssistantResponse(prompt: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[]) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are BharatVote, a friendly and expert assistant on Indian Elections and ECI (Election Commission of India) protocols.
  Your goal is to help users understand the election process, voter registration (NVSP), state-wise timelines, and candidate research in the Indian context.
  
  Focus on:
  1. Voter Registration: Explain Voter ID (EPIC), Aadhaar linking, NVSP portal, Form 6/7/8.
  2. Election Timelines: Lok Sabha vs Vidhan Sabha cycles, Model Code of Conduct (MCC), and state-specific phases.
  3. Candidate Information: Symbols, KYC (Know Your Candidate) app, and researching affidavits.
  4. Polling Protocols: EVM/VVPAT process, identification requirements (Voter Slip), and finding polling booths.
  
  Always maintain a helpful, neutral, and encouraging tone. Refer to ECI guidelines. If asked about political bias, explain you are an informational bridge for election procedures.
  Use Markdown for formatting. Mention official ECI resources whenever applicable.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I'm having trouble connecting to my civic database right now. Please try again in a moment.";
  }
}
