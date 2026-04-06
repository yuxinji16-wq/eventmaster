import { GoogleGenAI } from '@google/genai';

// 创建AI实例
const getAI = () => {
  const apiKey = import.meta.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not configured');
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// 获取营销洞察
export const getMarketingInsight = async (prompt: string): Promise<string> => {
  try {
    const ai = getAI();
    if (!ai) {
      return 'AI服务未配置，请设置GEMINI_API_KEY环境变量';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    return response.text || '获取洞察失败';
  } catch (error) {
    console.error('Gemini API error:', error);
    return '获取营销洞察时发生错误';
  }
};
