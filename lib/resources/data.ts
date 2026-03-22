import { LocalizedResourceModule, ResourceModule, ResourceModuleDefinition } from '@/types';

export const RESOURCE_MODULE_DEFINITIONS: ResourceModuleDefinition[] = [
  {
    id: 'paycheckLiteracy',
    imageUrl: '/mascot/afde.png',
    submodules: [
      { id: 'fiscal-ship', url: 'https://fiscalship.org/' },
      { id: 'uber-game', url: 'https://ig.ft.com/uber-game/' },
      { id: 'earnest-paycheck-deductions', url: 'https://www.earnest.com/blog/paycheck-deductions' },
      { id: 'benjamin-talks-paycheck', url: 'https://www.benjamintalks.com/thevault/decoding-a-paycheck' },
    ],
  },
  {
    id: 'housingBills',
    imageUrl: '/mascot/gpin.png',
    submodules: [
      { id: 'nerdwallet-cost-of-living', url: 'https://www.nerdwallet.com/cost-of-living-calculator' },
      { id: 'discover-roommate-costs', url: 'https://www.discover.com/online-banking/banking-topics/how-to-split-living-costs-with-your-roommate/' },
      { id: 'the-onion-rent-satire', url: 'https://theonion.com/landlord-forced-to-raise-rent-due-to-thinking-of-bigger-1850922943/' },
      { id: 'california-security-deposit-guide', url: 'https://selfhelp.courts.ca.gov/guide-security-deposits-california' },
      { id: 'first-apartment-hidden-costs', url: 'https://www.peachstatefcu.org/blog/unpacking-the-costs-of-your-first-apartment-what-tiktok-didnt-tell-you' },
    ],
  },
  {
    id: 'spendingControl',
    imageUrl: '/mascot/apie.png',
    submodules: [
      { id: 'ynab-four-rules', url: 'https://www.ynab.com/blog/ynab-four-rules-less-stress' },
      { id: 'investopedia-503020', url: 'https://www.investopedia.com/ask/answers/022916/what-502030-budget-rule.asp' },
      { id: 'thirty-day-rule', url: 'https://www.listenmoneymatters.com/what-is-the-30-day-rule/' },
    ],
  },
  {
    id: 'creditDebt',
    imageUrl: '/mascot/gfdn.png',
    submodules: [
      { id: 'evolution-of-trust', url: 'https://ncase.me/trust/' },
      { id: 'credit-interest-calculator', url: 'https://www.nerdwallet.com/credit-cards/learn/credit-card-interest-calculator' },
      { id: 'psychology-of-credit-card-spending', url: 'https://www.psychologytoday.com/us/blog/the-science-behind-behavior/201607/does-it-matter-whether-you-pay-cash-or-credit-card' },
      { id: 'credit-card-representative-confessions', url: 'https://www.rd.com/list/times-to-never-use-your-credit-card/' },
      { id: 'credit-scores-explained', url: 'https://www.visualcapitalist.com/visualizing-the-evolution-of-consumer-credit/' },
    ],
  },
  {
    id: 'safetyNet',
    imageUrl: '/mascot/afin.png',
    submodules: [
      { id: 'financial-football', url: 'https://www.financialfootball.com/play/' },
      { id: 'f-you-money', url: 'https://jlcollinsnh.com/2011/06/06/why-you-need-f-you-money/' },
      { id: 'build-emergency-fund', url: 'https://www.thebalancemoney.com/reasons-you-need-an-emergency-fund-2385536' },
      { id: 'financial-resilience-crisis', url: 'https://www.moneysense.ca/save/financial-planning/how-to-strengthen-your-financial-resilience/' },
    ],
  },
  {
    id: 'fraudSafety',
    imageUrl: '/mascot/gpde.png',
    submodules: [
      { id: 'google-phishing-quiz', url: 'https://phishingquiz.withgoogle.com/' },
      { id: 'psychology-of-scam', url: 'https://www.wired.com/video/watch/incognito-mode-romance-scams' },
      { id: 'scammed-out-of-50000', url: 'https://www.thecut.com/article/amazon-scam-call-ftc-arrest-warrants.html' },
      { id: 'credit-freeze-guide', url: 'https://krebsonsecurity.com/2018/09/credit-freezes-are-free-let-the-ice-age-begin/' },
      { id: 'identity-theft-horror-story', url: 'https://www.thecut.com/article/amazon-scam-call-ftc-arrest-warrants.html' },
      { id: 'password-debate', url: 'https://us.norton.com/feature/password-generator' },
      { id: 'social-engineering-vishing', url: 'https://www.social-engineer.org/framework/attack-vectors/vishing/' },
    ],
  },
];

export const RESOURCE_MODULES_FALLBACK_EN: LocalizedResourceModule[] = [
  {
    id: 'paycheckLiteracy',
    title: 'Paycheck Literacy',
    description: 'Understanding paychecks, deductions, taxes, and taxable income',
    submodules: [
      {
        id: 'fiscal-ship',
        title: 'The Fiscal Ship',
        summary: 'Interactive budget simulation about policy trade-offs and long-term federal debt sustainability.',
      },
      {
        id: 'uber-game',
        title: 'The Uber Game',
        summary: 'Gig-economy simulation showing the day-to-day income pressure of rideshare work.',
      },
      {
        id: 'earnest-paycheck-deductions',
        title: 'Everything Deducted From Your Paycheck, Explained (Earnest)',
        summary: 'Practical breakdown of payroll taxes, pre-tax benefits, and post-tax deductions.',
      },
      {
        id: 'benjamin-talks-paycheck',
        title: 'A Paycheck Overview for You and Your Child (Benjamin Talks)',
        summary: 'Beginner-friendly guide to gross pay, net pay, withholdings, and reading pay stubs.',
      },
    ],
  },
  {
    id: 'housingBills',
    title: 'Housing & Bills',
    description: 'Managing rent, utilities, deposits, and recurring obligations',
    submodules: [
      {
        id: 'nerdwallet-cost-of-living',
        title: 'Cost of Living Calculator (NerdWallet)',
        summary: 'Compare city expenses and estimate salary needs for relocation planning.',
      },
      {
        id: 'discover-roommate-costs',
        title: 'How to Split Living Costs With Your Roommate (Discover)',
        summary: 'Communication and cost-sharing tactics to avoid conflict in shared housing.',
      },
      {
        id: 'the-onion-rent-satire',
        title: 'Landlord Forced To Raise Rent Due To Thinking Of Bigger Number (The Onion)',
        summary: 'Satirical commentary on rent inflation and renter-landlord power imbalance.',
      },
      {
        id: 'california-security-deposit-guide',
        title: 'Guide to Security Deposits & Renter Rights (Self Help Courts)',
        summary: 'Official legal guidance on deposits, deductions, deadlines, and tenant rights.',
      },
      {
        id: 'first-apartment-hidden-costs',
        title: 'Unpacking the Costs of Your First Apartment',
        summary: 'Hidden first-apartment expenses beyond rent, with practical budgeting guardrails.',
      },
    ],
  },
  {
    id: 'spendingControl',
    title: 'Spending Control',
    description: 'Managing necessities, flexible spending, and budgeting habits',
    submodules: [
      {
        id: 'ynab-four-rules',
        title: 'How to Stress Less About Money: 4 Simple Rules (YNAB)',
        summary: 'A behavior-based budgeting framework to reduce money stress and build consistency.',
      },
      {
        id: 'investopedia-503020',
        title: 'The 50/30/20 Rule (Investopedia)',
        summary: 'Simple allocation model for needs, wants, and long-term financial goals.',
      },
      {
        id: 'thirty-day-rule',
        title: 'The 30-Day Rule for Impulse Purchases (The Balance)',
        summary: 'Cooling-off strategy that reduces emotional purchases and supports intentional spending.',
      },
    ],
  },
  {
    id: 'creditDebt',
    title: 'Credit & Debt',
    description: 'Using credit cards safely and understanding borrowing costs',
    submodules: [
      {
        id: 'evolution-of-trust',
        title: 'The Evolution of Trust',
        summary: 'Game-theory simulation about cooperation, incentives, and trust in repeated interactions.',
      },
      {
        id: 'credit-interest-calculator',
        title: 'Credit Card Interest Calculator (NerdWallet)',
        summary: 'Visual calculator for debt payoff time and total interest under different payment plans.',
      },
      {
        id: 'psychology-of-credit-card-spending',
        title: 'The Psychology of Credit Card Spending (Psychology Today)',
        summary: 'How payment methods change spending behavior and reduce awareness of real costs.',
      },
      {
        id: 'credit-card-representative-confessions',
        title: "Confessions of a Credit Card Representative (Reader's Digest)",
        summary: 'Situations where credit card use can be risky, expensive, or hard to unwind.',
      },
      {
        id: 'credit-scores-explained',
        title: 'Credit Scores Explained with Pizza (Visual Capitalist)',
        summary: 'Historical infographic showing the evolution of modern consumer credit systems.',
      },
    ],
  },
  {
    id: 'safetyNet',
    title: 'Safety Net',
    description: 'Insurance, emergency funds, and long-term financial resilience',
    submodules: [
      {
        id: 'financial-football',
        title: 'Financial Football',
        summary: 'NFL-themed game that teaches budgeting, debt, and savings through quick quizzes.',
      },
      {
        id: 'f-you-money',
        title: 'The F-You Money Concept (JL Collins)',
        summary: 'Why cash reserves create personal autonomy and protect decision freedom.',
      },
      {
        id: 'build-emergency-fund',
        title: 'How to Build an Emergency Fund (The Balance)',
        summary: 'What emergency funds are for and how they prevent debt spirals during shocks.',
      },
      {
        id: 'financial-resilience-crisis',
        title: 'Financial Resilience: How to Survive a Crisis (MoneySense)',
        summary: 'Framework for surviving disruptions with flexible budgets, insurance, and cash buffers.',
      },
    ],
  },
  {
    id: 'fraudSafety',
    title: 'Fraud & Safety',
    description: 'Protecting your identity, accounts, and credit profile',
    submodules: [
      {
        id: 'google-phishing-quiz',
        title: "Google's Phishing Quiz",
        summary: 'Interactive training to spot suspicious messages and social engineering red flags.',
      },
      {
        id: 'psychology-of-scam',
        title: 'The Psychology of the Scam (Wired)',
        summary: 'Documentary-style breakdown of emotional manipulation in modern scam operations.',
      },
      {
        id: 'scammed-out-of-50000',
        title: 'I Was Scammed Out of $50,000 (The Cut)',
        summary: 'Case study on how urgency and authority cues can override rational defenses.',
      },
      {
        id: 'credit-freeze-guide',
        title: 'How to Freeze Your Credit: A 3-Minute Guide (Brian Krebs)',
        summary: 'Step-by-step explanation of credit freezes to block fraudulent account openings.',
      },
      {
        id: 'identity-theft-horror-story',
        title: 'Identity Theft: A Modern Horror Story (Experian Blog)',
        summary: 'Identity fraud narrative showing financial and psychological fallout from scams.',
      },
      {
        id: 'password-debate',
        title: "The Great Password Debate: Is Your Dog's Name Enough? (Norton)",
        summary: 'Password hygiene guidance for strong credentials and breach containment.',
      },
      {
        id: 'social-engineering-vishing',
        title: 'Social Engineering: The Art of Human Hacking (Vishing)',
        summary: 'How voice phishing works and why verification habits are the key defense.',
      },
    ],
  },
];

const byId = <T extends { id: string }>(items: T[]): Map<string, T> => {
  return new Map(items.map((item) => [item.id, item]));
};

export const mergeLocalizedResourceModules = (
  localizedModules: LocalizedResourceModule[] | undefined | null,
): ResourceModule[] => {
  const sourceModules = Array.isArray(localizedModules) && localizedModules.length > 0
    ? localizedModules
    : RESOURCE_MODULES_FALLBACK_EN;

  const sourceModulesById = byId(sourceModules);

  return RESOURCE_MODULE_DEFINITIONS.map((moduleDef) => {
    const sourceModule = sourceModulesById.get(moduleDef.id) ||
      RESOURCE_MODULES_FALLBACK_EN.find((module) => module.id === moduleDef.id);

    const sourceSubmodulesById = byId(sourceModule?.submodules || []);

    return {
      id: moduleDef.id,
      title: sourceModule?.title || moduleDef.id,
      description: sourceModule?.description || '',
      imageUrl: moduleDef.imageUrl,
      submodules: moduleDef.submodules.map((submoduleDef) => {
        const sourceSubmodule = sourceSubmodulesById.get(submoduleDef.id);

        return {
          id: submoduleDef.id,
          title: sourceSubmodule?.title || submoduleDef.id,
          summary: sourceSubmodule?.summary || '',
          url: submoduleDef.url,
        };
      }),
    };
  });
};
