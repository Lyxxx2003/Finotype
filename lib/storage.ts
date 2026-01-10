export const STORAGE_KEY = 'finotype_answers';

export const saveAnswer = (questionId: number, answer: string) => {
  if (typeof window === 'undefined') return;
  const current = getAnswers();
  current[questionId] = answer;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
};

export const getAnswers = (): Record<number, string> => {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const clearAnswers = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};
