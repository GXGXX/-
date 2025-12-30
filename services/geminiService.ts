import { GoogleGenAI } from "@google/genai";
import { LifeExpectancyData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchLifeExpectancy = async (gender: string): Promise<LifeExpectancyData> => {
  // Preset data based on user request to speed up generation
  // Based on 2023 China National Baseline Data: Male 76, Female 80.
  let age = 78; // Default for 'general population' (parents) or fallback
  if (gender === 'male') age = 76;
  if (gender === 'female') age = 80;

  // Return immediately without API call
  return Promise.resolve({
    age,
    source: "中国国家基准数据 (预设)",
    year: "2023",
    country: "中国",
    gender
  });
};

export const sendChatMessage = async (
  message: string, 
  history: { role: 'user' | 'model'; text: string }[],
  useThinking: boolean = false
) => {
  try {
    const modelId = "gemini-3-pro-preview";
    
    const chatHistory = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }],
    }));

    const chat = ai.chats.create({
      model: modelId,
      history: chatHistory,
      config: {
        thinkingConfig: useThinking ? { thinkingBudget: 32768 } : undefined,
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "抱歉，我现在无法回答。请稍后再试。";
  }
};