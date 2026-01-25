'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(apiKey);

function getLanguageName(code: string): string {
  const languageMap: Record<string, string> = {
    'en': 'English',
    'zh': 'Chinese (Simplified)',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'ja': 'Japanese'
  };
  return languageMap[code] || 'English';
}

export interface UserProfile {
  industry: string;
  familiarity: string;
  salary?: string;
  paymentFreq?: string;
  language?: string; // User's preferred language
}

export interface JobOption {
  id: string;
  title: string;
  salary: number; // Annualized for calculation
  salaryLabel: string;
  bonus: string;
  healthInsurance: string;
  location: string;
  analysis: string; // Feedback on this career path
}

export interface LifeOption {
  id: string;
  title: string;
  description: string;
  analysis: string; // Immediate feedback
  cost: number;
  type: string; // 'monthly' or 'one-time'
}

export interface SimulationResult {
    finalBalance: number;
    netWorth: number;
    narrative: string;
    tips: string[];
    finotype: string;
    analysisByTopic?: Record<string, string>;
    error?: string;
}

function getFallbackJobs(profile: UserProfile): JobOption[] {
    return [
        { id: "1", title: "Junior " + profile.industry + " Associate", salary: 50000, salaryLabel: "$4,166/mo", bonus: "5% annual", healthInsurance: "Basic HMP", location: "Remote", analysis: "A great entry-level starting point with low pressure." },
        { id: "2", title: "Mid-Level " + profile.industry + " Specialist", salary: 75000, salaryLabel: "$6,250/mo", bonus: "10% annual + Stock Options", healthInsurance: "Standard PPO", location: "New York, NY", analysis: "Solid growth potential but comes with higher cost of living." },
        { id: "3", title: "Senior " + profile.industry + " Manager", salary: 120000, salaryLabel: "$10,000/mo", bonus: "20% annual + RSUs", healthInsurance: "Premium PPO + Dental", location: "San Francisco, CA", analysis: "High reward, high stress, and very high living costs." }
    ];
}

function getFallbackLifeOptions(topic: string): { description: string, options: LifeOption[] } {
    const fallbacks: any = {
        "Housing": {
            description: "Housing is likely your biggest monthly expense. Choosing correctly depends on your income and lifestyle.",
            options: [
                { id: "opt1", title: "Share an Apartment", description: "Split rent with roommates.", analysis: "Good choice! Budget-friendly.", cost: 800, type: "monthly" },
                { id: "opt2", title: "Studio Apartment", description: "Live alone in a modest space.", analysis: "Balanced choice for privacy and cost.", cost: 1500, type: "monthly" },
                { id: "opt3", title: "Luxury Condo", description: "High-end amenities and location.", analysis: "Expensive, but comfortable.", cost: 3000, type: "monthly" }
            ]
        },
        "Credit Cards": {
            description: "Credit cards can build credit or create debt. Pick one that matches your spending habits.",
            options: [
                { id: "opt1", title: "No Annual Fee Card", description: "Basic cash back, no perks.", analysis: "Safe, no-cost option.", cost: 0, type: "one-time" },
                { id: "opt2", title: "Travel Rewards Card", description: "Points for travel, $95 annual fee.", analysis: "Great if you travel often.", cost: 95, type: "one-time" },
                { id: "opt3", title: "Premium Platinum Card", description: "Lounge access, $695 annual fee.", analysis: "High fee, ensure you use the perks.", cost: 695, type: "one-time" }
            ]
        },
        "Investment": {
            description: "Investing helps grow your wealth over time. Consider your risk tolerance.",
            options: [
                { id: "opt1", title: "High Yield Savings", description: "Safe, low return (4-5%).", analysis: "Low risk, liquid cash.", cost: 500, type: "monthly" },
                { id: "opt2", title: "Index Funds (S&P 500)", description: "Moderate risk, checks market average.", analysis: "Solid long-term growth.", cost: 500, type: "monthly" },
                { id: "opt3", title: "Individual Crypto/Tech Stocks", description: "High risk, potential high reward.", analysis: "High risk, high variance.", cost: 500, type: "monthly" }
            ]
        },
        "Loans": {
                description: "Sometimes you need leverage. Be careful with interest rates.",
                options: [
                    { id: "opt1", title: "No Loans", description: "Live completely debt-free.", analysis: "Excellent for cash flow.", cost: 0, type: "monthly" },
                    { id: "opt2", title: "Car Loan", description: "Buy a new car.", analysis: "Depreciating asset, be careful.", cost: 400, type: "monthly" },
                    { id: "opt3", title: "Personal Loan for Vacation", description: "Borrow for a trip.", analysis: "Avoid borrowing for leisure.", cost: 200, type: "monthly" }
                ]
        }
    };
    const data = fallbacks[topic] || fallbacks["Housing"];
    return { description: data.description, options: data.options };
}

export async function generateJobs(profile: UserProfile, isDemo: boolean = false, locale: string = 'en'): Promise<{ jobs: JobOption[], error?: string }> {
    if (isDemo || !apiKey || apiKey.startsWith("TODO")) {
        return { jobs: getFallbackJobs(profile) };
    }

    const language = locale || 'en';
    const languageInstruction = language !== 'en' 
        ? `\n\nIMPORTANT: Generate ALL text content in ${getLanguageName(language)}. The job titles, analysis, and all descriptions should be in ${getLanguageName(language)}.` 
        : '';

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const prompt = `
        Generate 3 job offers for a user in the "${profile.industry}" industry.
        They expect a salary around "${profile.salary || 'market rate'}".
        
        Vary the salary, benefits (bonus/stocks), health insurance plans, and locations.
        Make them realistic.
        Include a short "analysis" string (1 sentence) critiquing this career path (e.g. "High pay but high stress").
        ${languageInstruction}
        
        Output JSON only:
        {
            "jobs": [
                {
                    "id": "1",
                    "title": "Job Title",
                    "salary": 60000, // Number, annual amount
                    "salaryLabel": "$5,000/mo", // String to display
                    "bonus": "Details about bonus/stock",
                    "healthInsurance": "Plan details",
                    "location": "City, State or Remote",
                    "analysis": "Short feedback"
                }
            ]
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error: any) {
        console.error("Gemini generateJobs failed, using fallback:", error);
        let errorType = "FALLBACK_USED";
        if (error.toString().includes("User location is not supported") || error.toString().includes("400")) {
             errorType = "REGION_BLOCKED";
        }
        return { 
            jobs: getFallbackJobs(profile),
            error: errorType
        };
    }
}

export async function generateLifeOptions(topic: string, context: any, isDemo: boolean = false, locale: string = 'en'): Promise<{ description: string, options: LifeOption[], error?: string }> {
    if (isDemo || !apiKey || apiKey.startsWith("TODO")) {
        return getFallbackLifeOptions(topic);
    }

    const language = locale || 'en';
    const languageInstruction = language !== 'en' 
        ? `\n\nIMPORTANT: Generate ALL text content in ${getLanguageName(language)}. The description, option titles, descriptions, and analysis should all be in ${getLanguageName(language)}.` 
        : '';

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const prompt = `
        Topic: ${topic}
        Context: User earns ${context.salary} annually.
        
        0. IMPORTANT: "analysis" field for each option is REQUIRED.
        1. Write a 1-sentence description of what "${topic}" means in personal finance.
        2. Generate 3 distinct options for the user to choose from regarding this topic.
           Include a cost (monthly or one-time) that is realistic for their salary.
           Include an "analysis" string that briefly critiques/praises this choice (e.g., "Smart frugal choice" or "High risk but potentially high reward").
        ${languageInstruction}
        
        Output JSON only:
        {
            "description": "...",
            "options": [
                {
                    "id": "1",
                    "title": "Option Name",
                    "description": "Short description",
                    "analysis": "Short feedback on this specific choice",
                    "cost": 1000,
                    "type": "monthly" // or "one-time"
                }
            ]
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error: any) {
        console.error("Gemini generateLifeOptions failed, using fallback:", error);
        let errorType = "FALLBACK_USED";
        if (error.toString().includes("User location is not supported") || error.toString().includes("400")) {
             errorType = "REGION_BLOCKED";
        }
        const fallback = getFallbackLifeOptions(topic);
        return {
            ...fallback,
            error: errorType
        };
    }
}

export async function simulateYear(
    profile: UserProfile, 
    job: JobOption, 
    choices: Record<string, LifeOption>, 
    isDemo: boolean = false,
    locale: string = 'en'
): Promise<SimulationResult> {
    const calculateFallback = () => {
        // Simple logic fallback
        const monthlyIncome = job.salary / 12;
        let monthlyExpenses = 0;
        let oneTimeExpenses = 0;

        Object.values(choices).forEach(choice => {
            if (choice.type === 'monthly') monthlyExpenses += choice.cost;
            else oneTimeExpenses += choice.cost;
        });

        const netAnnual = (monthlyIncome - monthlyExpenses) * 12 - oneTimeExpenses;
        // Simple "market" effect +5% to -5%
        const marketEffect = 1 + (Math.random() * 0.1 - 0.05);
        const finalBalance = Math.round(netAnnual * marketEffect);
        
        return {
            finalBalance: finalBalance > 0 ? finalBalance : 0,
            netWorth: Math.round(finalBalance + (Math.random() * 5000)), // Assuming some assets
            narrative: "In this simulation mode, your finances were calculated based on your inputs. You managed to balance your job and expenses.",
            tips: ["Review your monthly subscriptions", "Consider higher yield investments", "Building an emergency fund is key"],
            finotype: finalBalance > 10000 ? "The Saver" : "The Spender",
            analysisByTopic: {
                "Housing": "You chose a housing option that fits within your basic budget, but could be optimized.",
                "Credit Cards": "Your credit card choice reflects a cautious approach to debt.",
                "Investment": "You are starting to build a portfolio, which is excellent for long term growth.",
                "Loans": "Managing loans is critical. Your choice minimizes immediate interest impact."
            }
        };
    };

    if (isDemo || !apiKey || apiKey.startsWith("TODO")) {
        return calculateFallback();
    }

    const language = locale || 'en';
    const languageInstruction = language !== 'en' 
        ? `\n\nIMPORTANT: Generate ALL text content in ${getLanguageName(language)}. The narrative, finotype, tips, and analysisByTopic should all be in ${getLanguageName(language)}.` 
        : '';

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const inputs = JSON.stringify({ profile, job, choices });
    const prompt = `
        Simulate 1 year of financial life for this user based on their choices.
        Inputs: ${inputs}
        
        1. Calculate a realistic final bank balance and net worth after 1 year.
        2. Write a short narrative of their year.
        3. Identify their "Finotype" (Financial Persona).
        4. Give 3 tips.
        5. For each choice made (Housing, Credit Cards, etc.), provide a 1-sentence analysis/critique of that specific decision in the context of their profile. Key by topic ID.
        ${languageInstruction}
        
        Output JSON only:
        {
            "finalBalance": number,
            "netWorth": number,
            "narrative": "string",
            "finotype": "string", // e.g. "The Strategist"
            "tips": ["tip1", "tip2", "tip3"],
            "analysisByTopic": {
                "Housing": "Analysis of housing...",
                "Credit Cards": "Analysis..."
            }
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error: any) {
        console.error("Simulation failed", error);
        let errorType = "SIMULATION_ERROR";
        if (error.toString().includes("User location is not supported") || error.toString().includes("400")) {
             errorType = "REGION_BLOCKED";
        }
        return {
            ...calculateFallback(),
            narrative: "Gemini simulation failed. Falling back to basic calculation. " + (error.message || ""),
            error: errorType
        };
    }
}

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

export async function generateScenario(currentDay: number, currentPrice: number, isDemo: boolean = false): Promise<{
    news: string;
    priceChangePercent: number;
    error?: string;
}> {
  if (isDemo || !apiKey || apiKey.startsWith("TODO")) {
      const demoScenarios = [
          { news: "NebulaAI announces a breakthrough in quantum computing.", priceChangePercent: 0.12 },
          { news: "Regulatory concerns cause a slight dip in tech stocks.", priceChangePercent: -0.05 },
          { news: "Quarterly earnings beat expectations, investors rejoice.", priceChangePercent: 0.08 },
          { news: "Competitor launches a rival product, market reacts cautiously.", priceChangePercent: -0.03 },
          { news: "New partnership with major cloud provider confirmed.", priceChangePercent: 0.15 }
      ];
      // Pick based on day to be deterministic-ish or just random
      const scenario = demoScenarios[(currentDay - 1) % demoScenarios.length] || demoScenarios[0];
      
      return {
          news: `[DEMO] ${scenario.news}`,
          priceChangePercent: scenario.priceChangePercent
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
    console.error("[Gemini Scenario Error]", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      errorDetails: error.errorDetails || error.toString(),
      stack: error.stack
    });

    // Location/Region restrictions (400, 403)
    if (error.status === 400 || error.status === 403 || 
        error.toString().includes("400") || 
        error.toString().includes("User location is not supported")) {
        return {
            news: "Gemini is not supported for your location. Please try the simple Q/A version.",
            priceChangePercent: 0,
            error: "LOCATION_NOT_SUPPORTED"
        };
    }

    // Rate limiting (429)
    if (error.status === 429 || error.toString().includes("429") || 
        error.toString().includes("RESOURCE_EXHAUSTED")) {
        console.error("[Rate Limit] Too many requests to Gemini API");
        return {
            news: "Too many requests. Please try again in a moment.",
            priceChangePercent: 0,
            error: "RATE_LIMIT_EXCEEDED"
        };
    }

    // Invalid API Key (401)
    if (error.status === 401 || error.toString().includes("401") || 
        error.toString().includes("API_KEY_INVALID")) {
        console.error("[Auth Error] Invalid or missing API key");
        return {
            news: "API authentication failed. Please check configuration.",
            priceChangePercent: 0,
            error: "INVALID_API_KEY"
        };
    }

    // Network/Timeout errors
    if (error.toString().includes("ECONNREFUSED") || 
        error.toString().includes("ETIMEDOUT") ||
        error.toString().includes("fetch failed")) {
        console.error("[Network Error] Could not connect to Gemini API");
        return {
            news: "Network connection issue. Please check your internet.",
            priceChangePercent: 0,
            error: "NETWORK_ERROR"
        };
    }

    // Safety/Content filtering (400 with SAFETY)
    if (error.toString().includes("SAFETY") || error.toString().includes("blocked")) {
        console.error("[Safety Error] Content was blocked by safety filters");
        return {
            news: "Content generation blocked by safety filters.",
            priceChangePercent: 0,
            error: "SAFETY_FILTER"
        };
    }

    // Generic fallback
    console.error("[Unknown Error] Unhandled Gemini error type");
    return {
        news: "Analysts are uncertain about the market direction today.",
        priceChangePercent: 0,
        error: "UNKNOWN_ERROR"
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
        console.error("[Gemini Analysis Error]", {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            errorDetails: error.errorDetails || error.toString(),
            stack: error.stack
        });

        // Location/Region restrictions (400, 403)
        if (error.status === 400 || error.status === 403 || 
            error.toString().includes("400") || 
            error.toString().includes("User location is not supported")) {
            return {
                profile: "Location Not Supported",
                summary: "Gemini is not supported for your location. Please try the simple Q/A version.",
                tips: ["Use the simple Q/A version"],
                error: "LOCATION_NOT_SUPPORTED"
            };
        }

        // Rate limiting (429)
        if (error.status === 429 || error.toString().includes("429") || 
            error.toString().includes("RESOURCE_EXHAUSTED")) {
            console.error("[Rate Limit] Too many analysis requests");
            return {
                profile: "Rate Limited",
                summary: "Too many requests. Please wait a moment and try again.",
                tips: ["Wait a few minutes before requesting another analysis"],
                error: "RATE_LIMIT_EXCEEDED"
            };
        }

        // Invalid API Key (401)
        if (error.status === 401 || error.toString().includes("401") || 
            error.toString().includes("API_KEY_INVALID")) {
            console.error("[Auth Error] Invalid or missing API key for analysis");
            return {
                profile: "Authentication Failed",
                summary: "API authentication failed. Please contact support.",
                tips: ["Check API key configuration"],
                error: "INVALID_API_KEY"
            };
        }

        // Network/Timeout errors
        if (error.toString().includes("ECONNREFUSED") || 
            error.toString().includes("ETIMEDOUT") ||
            error.toString().includes("fetch failed")) {
            console.error("[Network Error] Could not connect to Gemini for analysis");
            return {
                profile: "Network Issue",
                summary: "Could not connect to analysis service. Check your internet connection.",
                tips: ["Verify your internet connection", "Try again in a moment"],
                error: "NETWORK_ERROR"
            };
        }

        // Safety/Content filtering
        if (error.toString().includes("SAFETY") || error.toString().includes("blocked")) {
            console.error("[Safety Error] Analysis content was blocked");
            return {
                profile: "Content Filtered",
                summary: "Analysis was blocked by content safety filters.",
                tips: ["Try playing again with different strategies"],
                error: "SAFETY_FILTER"
            };
        }

        // Generic fallback
        console.error("[Unknown Error] Unhandled analysis error type");
        return {
            profile: "Unknown",
            summary: "Could not analyze data due to an unexpected error.",
            tips: ["Try again later", "Contact support if the issue persists"],
            error: "UNKNOWN_ERROR"
        };
    }
}
