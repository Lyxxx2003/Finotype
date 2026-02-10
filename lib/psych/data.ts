import { Question, Persona } from '@/types';

export const questions: Question[] = [
  {
    id: 1,
    text: "It’s the weekend. You see a limited-edition item you really like, but it costs 30% more than your monthly budget. What would you do?",
    options: [
      { label: "Buy it immediately — if I miss it now, it’s gone.", value: 'A' },
      { label: "Walk away and review next month’s budget to see if I can afford it.", value: 'B' },
      { label: "Decide I don’t really need it after all.", value: 'C' },
      { label: "Check its resale value; if it holds value well, I’ll buy it.", value: 'D' },
    ],
  },
  {
    id: 2,
    text: "You have some spare cash and can choose only one of the following:",
    options: [
      { label: "Invest in a friend’s project — it could increase fivefold in one year or lose everything.", value: 'A' },
      { label: "Put it into a stable investment with a guaranteed 4.5% annual return.", value: 'B' },
    ],
  },
  {
    id: 3,
    text: "While scrolling on your phone, you see content titled “How to Achieve Financial Freedom by Age 30.” What is your most likely reaction?",
    options: [
      { label: "Carefully study the financial concepts mentioned (e.g., volatility, Sharpe ratio).", value: 'A' },
      { label: "Save it for later, though I haven’t put it into practice.", value: 'B' },
      { label: "Assume it’s anxiety-driven marketing and scroll past.", value: 'C' },
      { label: "Take out paper or a calculator to estimate my own financial gap.", value: 'D' },
    ],
  },
  {
    id: 4,
    text: "A highly accurate fortune-teller lets you see one moment of your future. What do you most want to see?",
    options: [
      { label: "Myself at age 60, financially secure with a well-planned retirement.", value: 'A' },
      { label: "Myself one year from now, freely spending this money on travel or leisure.", value: 'B' },
      { label: "Confirmation that next month’s bills are fully paid.", value: 'C' },
    ],
  },
  {
    id: 5,
    text: "You order an extremely expensive but bad-tasting dish at a restaurant (non-refundable). What do you do?",
    options: [
      { label: "Finish it — every bite represents money.", value: 'A' },
      { label: "Stop eating; the money is already gone, and my health matters more.", value: 'B' },
      { label: "Try to fix it with extra seasoning, even if it likely won’t help.", value: 'C' },
    ],
  },
  {
    id: 6,
    text: "Compared to having a large sum of money ten years from now, I care more about being able to enjoy life and travel freely right now.",
    options: [
      { label: "1", value: '1' },
      { label: "2", value: '2' },
      { label: "3", value: '3' },
      { label: "4", value: '4' },
      { label: "5", value: '5' },
      { label: "6", value: '6' },
      { label: "7", value: '7' },
    ],
  },
  {
    id: 7,
    text: "I enjoy the excitement of searching for opportunities in uncertain or volatile markets.",
    options: [
      { label: "1", value: '1' },
      { label: "2", value: '2' },
      { label: "3", value: '3' },
      { label: "4", value: '4' },
      { label: "5", value: '5' },
      { label: "6", value: '6' },
      { label: "7", value: '7' },
    ],
  },
  {
    id: 8,
    text: "If I overspend unexpectedly, I feel noticeable guilt for several days afterward.",
    options: [
      { label: "1", value: '1' },
      { label: "2", value: '2' },
      { label: "3", value: '3' },
      { label: "4", value: '4' },
      { label: "5", value: '5' },
      { label: "6", value: '6' },
      { label: "7", value: '7' },
    ],
  },
  {
    id: 9,
    text: "Which of the following describe your current behavior? (Select all that apply.)",
    options: [
      { label: "I subscribe to at least two in-depth finance newsletters or research reports.", value: 'A' },
      { label: "I regularly use tools (e.g., Excel, apps) to track my net worth.", value: 'B' },
      { label: "I understand asset allocation and hold at least three different asset types.", value: 'C' },
      { label: "I frequently rebalance my portfolio based on market trends.", value: 'D' },
    ],
    multiSelect: true,
  },
  {
    id: 10,
    text: "During large promotions (e.g., Black Friday), which behaviors apply to you? (Select all that apply.)",
    options: [
      { label: "I plan purchases in advance and stick strictly to my list.", value: 'A' },
      { label: "I feel overwhelmed by discount rules and buy casually.", value: 'B' },
      { label: "I stay up late watching livestreams and buy due to the atmosphere.", value: 'C' },
      { label: "I calculate post-discount prices and avoid buying if the cost of holding inventory is too high.", value: 'D' },
    ],
    multiSelect: true,
  },
  {
    id: 11,
    text: "If I suddenly receive unexpected money, my first thought is how to spend it rather than how to save it.",
    options: [
      { label: "Yes", value: 'Yes' },
      { label: "No", value: 'No' },
    ],
  },
  {
    id: 12,
    text: "I believe insurance is mostly unnecessary or a waste of money for low-probability events.",
    options: [
      { label: "Yes", value: 'Yes' },
      { label: "No", value: 'No' },
    ],
  },
  {
    id: 13,
    text: "I rarely check shopping app notifications; my purchases are usually initiated by active searching.",
    options: [
      { label: "Yes", value: 'Yes' },
      { label: "No", value: 'No' },
    ],
  },
  {
    id: 14,
    text: "Saving money now feels meaningless because inflation will erode future purchasing power anyway.",
    options: [
      { label: "Yes", value: 'Yes' },
      { label: "No", value: 'No' },
    ],
  },
  {
    id: 15,
    text: "If a long-term asset I hold drops 20% in a single month, I become so anxious that it affects my sleep.",
    options: [
      { label: "Yes", value: 'Yes' },
      { label: "No", value: 'No' },
    ],
  },
];

const buildPersona = (id: string): Persona => {
  return {
    id: id as Persona['id'],
    name: id,
    mascot: `mascot/${id.toLowerCase()}.png`,
    description: '', // Description comes from i18n
  };
};

const personaIds = [
  'AFDE', 'AFDN', 'AFIE', 'AFIN',
  'APDE', 'APDN', 'APIE', 'APIN',
  'GFDE', 'GFDN', 'GFIE', 'GFIN',
  'GPDE', 'GPDN', 'GPIE', 'GPIN',
];

export const personas: Record<string, Persona> = Object.fromEntries(
  personaIds.map((id) => [id, buildPersona(id)])
);
