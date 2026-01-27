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
        console.error("[Gemini generateJobs Error]", {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            errorDetails: error.errorDetails || error.toString(),
            stack: error.stack
        });
        
        let errorType = "FALLBACK_USED";
        
        // Location/Region blocking (400, 403)
        if (error.status === 400 || error.status === 403 || 
            error.toString().includes("400") || 
            error.toString().includes("403") ||
            error.toString().includes("User location is not supported") ||
            error.toString().includes("PERMISSION_DENIED")) {
            errorType = "REGION_BLOCKED";
        }
        
        // Rate limiting (429)
        if (error.status === 429 || 
            error.toString().includes("429") || 
            error.toString().includes("RESOURCE_EXHAUSTED")) {
            errorType = "RATE_LIMIT_EXCEEDED";
        }
        
        // API key issues
        if (error.status === 401 || 
            error.toString().includes("API key") ||
            error.toString().includes("UNAUTHENTICATED")) {
            errorType = "INVALID_API_KEY";
        }
        
        // Safety/content filter
        if (error.toString().includes("SAFETY") ||
            error.toString().includes("content filter")) {
            errorType = "SAFETY_FILTER";
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
        console.error("[Gemini generateLifeOptions Error]", {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            errorDetails: error.errorDetails || error.toString(),
            stack: error.stack
        });
        
        let errorType = "FALLBACK_USED";
        
        // Location/Region blocking (400, 403)
        if (error.status === 400 || error.status === 403 || 
            error.toString().includes("400") || 
            error.toString().includes("403") ||
            error.toString().includes("User location is not supported") ||
            error.toString().includes("PERMISSION_DENIED")) {
            errorType = "REGION_BLOCKED";
        }
        
        // Rate limiting (429)
        if (error.status === 429 || 
            error.toString().includes("429") || 
            error.toString().includes("RESOURCE_EXHAUSTED")) {
            errorType = "RATE_LIMIT_EXCEEDED";
        }
        
        // API key issues
        if (error.status === 401 || 
            error.toString().includes("API key") ||
            error.toString().includes("UNAUTHENTICATED")) {
            errorType = "INVALID_API_KEY";
        }
        
        // Safety/content filter
        if (error.toString().includes("SAFETY") ||
            error.toString().includes("content filter")) {
            errorType = "SAFETY_FILTER";
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
        console.error("[Gemini simulateYear Error]", {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            errorDetails: error.errorDetails || error.toString(),
            stack: error.stack
        });
        
        let errorType = "SIMULATION_ERROR";
        
        // Location/Region blocking (400, 403)
        if (error.status === 400 || error.status === 403 || 
            error.toString().includes("400") || 
            error.toString().includes("403") ||
            error.toString().includes("User location is not supported") ||
            error.toString().includes("PERMISSION_DENIED")) {
            errorType = "REGION_BLOCKED";
        }
        
        // Rate limiting (429)
        if (error.status === 429 || 
            error.toString().includes("429") || 
            error.toString().includes("RESOURCE_EXHAUSTED")) {
            errorType = "RATE_LIMIT_EXCEEDED";
        }
        
        // API key issues
        if (error.status === 401 || 
            error.toString().includes("API key") ||
            error.toString().includes("UNAUTHENTICATED")) {
            errorType = "INVALID_API_KEY";
        }
        
        // Safety/content filter
        if (error.toString().includes("SAFETY") ||
            error.toString().includes("content filter")) {
            errorType = "SAFETY_FILTER";
        }
        
        return {
            ...calculateFallback(),
            error: errorType
        };
    }
}