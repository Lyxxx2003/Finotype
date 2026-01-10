import { Question, Persona } from '@/types';

export const questions: Question[] = [
  // Spending Habits (Frugal vs Lavish)
  {
    id: 1,
    text: "When you receive your paycheck, what is your first instinct?",
    options: [
      { label: "Immediately transfer a portion to savings", value: 'F' },
      { label: "Check my wish list and treat myself", value: 'L' },
    ],
  },
  {
    id: 2,
    text: "How do you handle grocery shopping?",
    options: [
      { label: "I stick to a strict list and look for discounts", value: 'F' },
      { label: "I buy whatever looks good or inspires me", value: 'L' },
    ],
  },
  {
    id: 3,
    text: "A new phone model just came out. You...",
    options: [
      { label: "Wait until my current one completely dies", value: 'F' },
      { label: "Consider upgrading if it has cool new features", value: 'L' },
    ],
  },
  {
    id: 4,
    text: "Your friends invite you to an expensive dinner. You...",
    options: [
      { label: "Suggest a cheaper alternative or declilne politely", value: 'F' },
      { label: "Go along! Experiences are worth paying for", value: 'L' },
    ],
  },
  {
    id: 5,
    text: "What does 'budgeting' mean to you?",
    options: [
      { label: "A daily ritual I strictly follow", value: 'F' },
      { label: "A vague guideline I try to keep in mind", value: 'L' },
    ],
  },
  // Investment Risk (Cautious vs Adventurous)
  {
    id: 6,
    text: "If you had $10,000 to invest, where would you put it?",
    options: [
      { label: "A high-yield savings account or bonds", value: 'C' },
      { label: "Crypto or a high-growth stock startup", value: 'A' },
    ],
  },
  {
    id: 7,
    text: "How do you feel about the stock market crashing?",
    options: [
      { label: "Terrified, I might pull my money out", value: 'C' },
      { label: "Excited, it's a buying opportunity!", value: 'A' },
    ],
  },
  {
    id: 8,
    text: "You hear about a risky investment with potential 10x returns. You...",
    options: [
      { label: "Stay away, it sounds like a scam or gamble", value: 'C' },
      { label: "Invest a small amount just to see what happens", value: 'A' },
    ],
  },
  {
    id: 9,
    text: "When planning for retirement, you prefer...",
    options: [
      { label: "Guaranteed stable income", value: 'C' },
      { label: "Maximum possible growth, even if risky", value: 'A' },
    ],
  },
  {
    id: 10,
    text: "Your financial knowledge mainly comes from...",
    options: [
      { label: "Established books and certified advisors", value: 'C' },
      { label: "Online forums, Twitter/X, and trends", value: 'A' },
    ],
  },
];

export const personas: Record<string, Persona> = {
  'FC': {
    id: 'FC',
    name: "The Guardian",
    mascot: "🛡️",
    description: "You are the bedrock of financial stability. You value security over luxury and prefer steady, predictable growth.",
    strengths: ["Excellent saver", "Prepared for emergencies", "Disciplined"],
    pitfalls: ["Risk aversion may lead to inflation loss", "Missed opportunities for growth", "Can be too frugal to enjoy life"],
    tips: ["Allocate a small 'fun budget' guilt-free", "Explore low-cost index funds to beat inflation", "Remember that money is a tool, not just a scoreboard"],
  },
  'FA': {
    id: 'FA',
    name: "The Strategist",
    mascot: "♟️",
    description: "You are disciplined with spending but bold with investing. You save aggressively to fuel your high-growth ambitions.",
    strengths: ["High savings rate", "Forward-thinking", "Capitalizes on compound interest"],
    pitfalls: ["Might take uncalculated risks with hard-earned savings", "Can overlook liquidity needs", "Overconfidence"],
    tips: ["Ensure you have a liquid emergency fund before heavy investing", "Diversify your high-risk bets", "Balance your portfolio with some stable assets"],
  },
  'LC': {
    id: 'LC',
    name: "The Enthusiast",
    mascot: "🎉",
    description: "You love to enjoy the present moment and prefer your investments to be safe and sound. You work hard to spend well.",
    strengths: ["Generous", "Enjoys life", "Avoids gambling with money"],
    pitfalls: ["Low savings rate", "Lifestyle creep", "Financial stress from lack of buffer"],
    tips: ["Automate savings before you see the money", "Use the 50/30/20 rule to structure spending", "Find low-cost ways to enjoy your hobbies"],
  },
  'LA': {
    id: 'LA',
    name: "The Maverick",
    mascot: "🚀",
    description: "You live fast and invest fast. High earning potential, high spending, and high risk tolerance define your style.",
    strengths: ["Not afraid of failure", "Ambitious", "Adaptable"],
    pitfalls: ["High volatility in net worth", "Debt accumulation", "Lack of long-term security"],
    tips: ["Focus on cash flow management", "Pay off high-interest debt immediately", "Create a 'do not touch' safety net account"],
  },
};
