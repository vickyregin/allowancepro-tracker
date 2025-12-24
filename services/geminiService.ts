
import { GoogleGenAI } from "@google/genai";
import { Expense } from "../types";

export const getFinancialInsights = async (expenses: Expense[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const expenseSummary = expenses.map(e => ({
    amount: e.amount,
    category: e.category,
    date: e.date,
    desc: e.description,
    project: e.project
  }));

  const prompt = `Analyze these monthly expenses and provide 3-4 concise, professional financial insights or savings tips.
  Categories focused on: Local Travel, Accommodation, Daily Allowance, Maintenance, Repairs.
  Include considerations for spending efficiency across different projects.
  
  Data: ${JSON.stringify(expenseSummary)}
  
  Respond in a friendly but professional tone. Focus on patterns or unusual spending.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "No insights available at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating insights. Please try again later.";
  }
};
