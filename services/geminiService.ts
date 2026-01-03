import { GoogleGenAI } from "@google/genai";
import { LifeExpectancyData } from "../types";

// Remove top-level initialization to prevent crash if API_KEY is missing during build/render
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    const apiKey = process.env.API_KEY;

    // Check if API Key exists before initializing
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      return "⚠️ 尚未检测到 API Key。\n\n这通常是因为环境变量没有正确注入。\n请尝试在 Vercel 对应的 Deployment 中点击 'Redeploy' (重新部署) 以便让新的环境变量生效。";
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Use Flash for faster response and higher availability on free tiers
    // Use Pro only when Thinking Mode is explicitly requested
    const modelId = useThinking ? "gemini-3-pro-preview" : "gemini-3-flash-preview";
    
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
  } catch (error: any) {
    console.error("Chat error:", error);
    const errorMsg = error.message || error.toString();
    
    // Handle Quota/Rate Limit (429 / RESOURCE_EXHAUSTED)
    if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota")) {
       return `⏳ **额度已用尽 (429)**\n\nGoogle Gemini API 的调用频率或额度已达上限。\n\n**建议：**\n1. 请休息几分钟再试（免费版有每分钟限制）。\n2. 尝试关闭“深度思考”模式（该模式消耗额度更多）。\n3. 如果持续报错，可能今日额度已耗尽，请明日再试。`;
    }

    // Handle Google Cloud API Key Restrictions (Referer Blocked)
    if (errorMsg.includes("blocked") && (errorMsg.includes("referer") || errorMsg.includes("PERMISSION_DENIED"))) {
        return `🚫 **访问被拒绝 (403)**\n\n您的 API Key 设置了【网站限制】，但 Vercel 的网址未被允许。\n\n**解决方法：**\n1. 打开 Google Cloud Console > Credentials。\n2. 编辑您的 API Key。\n3. 在 "Website restrictions" 中添加当前网址：\n   \`${window.location.origin}\`\n4. 或者暂时选择 "None" 取消限制。`;
    }

    // Return friendly error message based on common issues
    if (errorMsg.includes("400") || errorMsg.includes("API key not valid")) {
       return `❌ API Key 无效。\n请检查 Vercel 环境变量中填写的 API Key 是否有复制错误（如多余的空格）。\n(错误信息: ${errorMsg})`;
    }
    
    return `抱歉，AI 服务暂时不可用。\n错误详情: ${errorMsg}\n\n请稍后再试，或关闭“深度思考”模式。`;
  }
};