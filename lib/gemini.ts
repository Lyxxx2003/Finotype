'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(apiKey);

export interface GameState {
  ticker: string;
  price: number;
  day: number;
  news: string;
  history: GameEvent[];
}

export interface GameEvent {
  day: number;
  action: 'buy' | 'sell' | 'hold' | 'loan' | 'repay';
  amount?: number;
  priceAtAction: number;
  reasoning?: string; // Optional user input
}

export async function generateScenario(currentDay: number, currentPrice: number): Promise<{
    news: string;
    priceChangePercent: number;
    error?: string;
}> {
  if (!apiKey || apiKey.startsWith("TODO")) {
      // Mock response for testing without API key
      return {
          news: "Market is stable but rumors of a new tech regulation are spreading.",
          priceChangePercent: (Math.random() * 0.1) - 0.05 // -5% to +5%
      }
  }

  // Attempt to use the latest model which often bypasses strict region locks on older models
  const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
  });
  const prompt = `
    You are a financial market simulator game master. 
    Current Day: ${currentDay}
    Current Stock Price: ${currentPrice}
    
    Generate a short, realistic financial news headline (1 sentence) regarding a fictional tech company "NebulaAI". 
    Then determine a percentage price change for the stock based on this news (between -15% and +15%).
    
    Output JSON only: { "news": "string", "priceChangePercent": number }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Clean up markdown code blocks if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error: any) {
    console.error("Gemini Error:", error);

    if (error.toString().includes("400") || error.status === 400) {
        return {
            news: "Gemini is not supported for your location. Please try the simple Q/A version.",
            priceChangePercent: 0,
            error: "LOCATION_NOT_SUPPORTED"
        };
    }

    return {
        news: "Analysts are uncertain about the market direction today.",
        priceChangePercent: 0
    };
  }
}

export async function analyzeBehavior(events: GameEvent[]): Promise<{
    profile: string;
    summary: string;
    tips: string[];
    error?: string;
}> {
    if (!apiKey || apiKey.startsWith("TODO")) {
        return {
            profile: "Demo Trader",
            summary: "You took some risks but mostly played it safe. (Gemini API Key missing)",
            tips: ["Add a valid Gemini API Key to get real analysis", "Diversify portfolio"]
        }
    }

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp" 
    });
    const eventsJson = JSON.stringify(events);
    
    const prompt = `
      You are an expert financial behavioral psychologist. 
      Analyze the following user actions from a stock trading simulation game:
      ${eventsJson}
      
      Identify their trading personality (e.g., "FOMO Chaser", "Value Investor", "Panic Seller", etc.).
      Write a brief summary of their behavior.
      Provide 3 actionable tips to improve their emotional regulation and financial decision making.
      
      Output JSON only: { "profile": "string", "summary": "string", "tips": ["string", "string", "string"] }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error: any) {
        console.error("Gemini Analysis Error:", error);

        if (error.toString().includes("400") || error.status === 400) {
             return {
                profile: "Location Not Supported",
                summary: "Gemini is not supported for your location. Please try the simple Q/A version.",
                tips: ["Use the simple Q/A version"],
                error: "LOCATION_NOT_SUPPORTED"
             };
        }

        return {
            profile: "Unknown",
            summary: "Could not analyze data due to an error.",
            tips: ["Try again later"]
        };
    }
}
