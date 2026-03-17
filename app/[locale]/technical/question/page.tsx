'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import RadarChart from '@/components/RadarChart';
import {
  downloadElementAsImage,
  nativeShareElement,
  copyShareLink,
  shareToX,
  shareToFacebook,
} from '@/components/ShareUtil';

type SkillKey =
  | 'paycheckLiteracy'
  | 'housingBills'
  | 'spendingControl'
  | 'creditDebt'
  | 'safetyNet'
  | 'fraudSafety';

type Scores = Record<SkillKey, number>;

type Choice = {
  id: string;
  text: string;
  impact: Partial<Record<SkillKey, number>>;
};

type Question = {
  id: string;
  title: string;
  context?: string;
  prompt: string;
  choices: Choice[];
  correctChoiceId: string;
  explanation: string;
};

type LessonBlock = {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  questions: Question[];
};

type Module = {
  id: string;
  title: string;
  shortDescription: string;
  lessonBlocks: LessonBlock[];
  takeaway: string[];
};

const SKILLS: { key: SkillKey; label: string; description: string }[] = [
  { key: 'paycheckLiteracy', label: 'Paycheck Literacy', description: 'Understanding paychecks, deductions, taxes, and taxable income' },
  { key: 'housingBills', label: 'Housing & Bills', description: 'Managing rent, utilities, deposits, and recurring obligations' },
  { key: 'spendingControl', label: 'Spending Control', description: 'Managing necessities, flexible spending, and budgeting habits' },
  { key: 'creditDebt', label: 'Credit & Debt', description: 'Using credit cards safely and understanding borrowing costs' },
  { key: 'safetyNet', label: 'Safety Net', description: 'Insurance, emergency funds, and long-term financial resilience' },
  { key: 'fraudSafety', label: 'Fraud & Safety', description: 'Protecting your identity, accounts, and credit profile' },
];

const GLOSSARY: Record<string, string> = {
  "Gross Pay": "Your earnings before taxes and deductions are taken out.",
  "Net Pay": "The amount that actually lands in your bank account after deductions.",
  "Taxable Income": "The portion of your income subject to income tax after eligible adjustments or pre-tax deductions.",
  "Withholding": "Money taken from your paycheck in advance to cover taxes.",
  "W-4": "A form used to help determine federal tax withholding from your paycheck.",
  "FICA": "Payroll taxes that fund Social Security and Medicare.",
  "Pre-tax Deduction": "A deduction taken before some taxes are calculated.",
  "Pay Stub": "A record showing gross pay, deductions, taxes, and net pay.",
  "Fixed Expense": "A cost that stays about the same each month, such as rent.",
  "Variable Expense": "A cost that changes month to month, such as groceries or gas.",
  "Security Deposit": "Money paid upfront to protect a landlord against damage or unpaid rent.",
  "Checking Account": "A bank account used for everyday spending and bill payments.",
  "Savings Account": "A bank account designed to hold money and usually earn interest.",
  "Debit Card": "A card linked to your checking account; purchases come directly from your balance.",
  "Credit Card": "A borrowing tool with a limit; unpaid balances may accrue interest.",
  "APR": "Annual Percentage Rate, the yearly cost of borrowing on a credit card or loan.",
  "Credit Utilization": "The percentage of your available credit currently being used.",
  "Statement Balance": "The amount owed on your card at the end of a billing cycle.",
  "Minimum Payment": "The smallest payment required to keep a credit card account current.",
  "Annual Fee": "A yearly fee charged by some credit cards.",
  "Foreign Transaction Fee": "A fee charged by some cards for purchases in another country or currency.",
  "Premium": "The amount you pay regularly to keep insurance coverage active.",
  "Deductible": "The amount you pay before insurance starts sharing covered costs.",
  "Copay": "A fixed amount you pay for a covered medical service.",
  "Coinsurance": "The percentage of covered medical costs you pay after meeting your deductible.",
  "Out-of-Pocket Maximum": "The most you pay in a plan year for covered healthcare before the insurer pays 100% of covered costs.",
  "In-Network": "Doctors and providers that have negotiated prices with your insurance plan.",
  "401(k)": "An employer-sponsored retirement account that may include employer matching.",
  "Employer Match": "Money your employer contributes to your retirement account based on your contribution.",
  "Renter Insurance": "Insurance that helps cover your belongings and personal liability while renting.",
  "Auto Insurance": "Insurance that may cover vehicle damage, liability, and related losses.",
  "Emergency Fund": "Savings reserved for urgent, unexpected expenses.",
  "Liquidity": "How quickly you can access money without losing value.",
  "Phishing": "A scam that tricks you into revealing information through fake emails, texts, or websites.",
  "Identity Theft": "When someone uses your personal information without permission.",
  "Credit Freeze": "A restriction on access to your credit report to help prevent fraudulent new accounts.",
  "Experian": "One of the three major U.S. credit bureaus.",
  "Equifax": "One of the three major U.S. credit bureaus.",
  "TransUnion": "One of the three major U.S. credit bureaus.",
  "HSA": "A Health Savings Account used with qualifying health plans for eligible medical expenses.",
  "Certificate of Deposit": "A bank product with a fixed term and usually a fixed interest rate.",
  "RSU": "Restricted Stock Unit, a company stock grant that usually vests over time.",
  "Fund": "An investment vehicle, such as an ETF or mutual fund, that holds many underlying investments.",
  "Diversification": "Spreading investments across assets to reduce concentration risk.",
  "APY": "Annual Percentage Yield, the yearly return on a deposit including compounding.",
  "Direct Deposit": "Electronic deposit of pay into your bank account.",
  "Overdraft": "When a transaction exceeds the available balance in your checking account.",
  "Due Date": "The date by which a bill or payment must be made.",
  "RSU Vesting": "The schedule that determines when you actually gain ownership of granted company shares.",
};

const MODULES: Module[] = [
  {
    id: 'paycheck',
    title: '1. Paycheck & Taxes',
    shortDescription: 'Understand how compensation becomes take-home pay.',
    lessonBlocks: [
      {
        id: 'pay-1',
        heading: 'Gross pay, net pay, and why your first deposit looks smaller',
        paragraphs: [
          `As a new grad, one of the first surprises is that your salary offer is not what lands in your bank account. Your paycheck starts with [[Gross Pay]], then subtracts taxes, benefits, and other deductions before you receive [[Net Pay]].`,
          `Your monthly budget should be built from net pay, not from annual salary or gross pay. That keeps rent, bills, and savings plans grounded in the money you actually have.`
        ],
        bullets: [
          'Gross pay is before deductions',
          'Net pay is what you can actually spend or save',
          'Always budget using net pay'
        ],
        questions: [
          {
            id: 'q_pay_1',
            title: 'Question 1',
            prompt: 'Which number should you use to build your monthly budget?',
            correctChoiceId: 'B',
            explanation: 'Your budget should be based on the money you actually receive: net pay.',
            choices: [
              { id: 'A', text: 'Gross pay', impact: { paycheckLiteracy: 6 } },
              { id: 'B', text: 'Net pay', impact: { paycheckLiteracy: 20 } },
              { id: 'C', text: 'Annual salary divided by 10', impact: { paycheckLiteracy: 0 } },
              { id: 'D', text: 'The amount before taxes plus estimated bonus', impact: { paycheckLiteracy: 0 } },
            ],
          },
          {
            id: 'q_pay_2',
            title: 'Question 2',
            prompt: 'Which statement is most accurate?',
            correctChoiceId: 'D',
            explanation: 'Net pay is gross pay minus taxes and deductions.',
            choices: [
              { id: 'A', text: 'Gross pay is always lower than net pay', impact: { paycheckLiteracy: 0 } },
              { id: 'B', text: 'Net pay is before taxes', impact: { paycheckLiteracy: 0 } },
              { id: 'C', text: 'Salary offer equals monthly spendable cash', impact: { paycheckLiteracy: 2 } },
              { id: 'D', text: 'Net pay is what remains after taxes and deductions', impact: { paycheckLiteracy: 20 } },
            ],
          },
        ],
      },
      {
        id: 'pay-2',
        heading: 'Taxable income, withholding, and FICA',
        paragraphs: [
          `Many early-career workers treat taxes as one single line, but your paycheck often includes different categories. [[Withholding]] is money taken out in advance for income taxes. [[FICA]] covers Social Security and Medicare.`,
          `[[Taxable Income]] is the portion of income actually subject to income tax. Some [[Pre-tax Deduction]] items can reduce taxable income before tax is calculated.`
        ],
        bullets: [
          'FICA is separate from income tax withholding',
          'Taxable income can be lower than gross income',
          'Pre-tax deductions may reduce some tax exposure'
        ],
        questions: [
          {
            id: 'q_pay_3',
            title: 'Question 3',
            prompt: 'What is withholding?',
            correctChoiceId: 'A',
            explanation: 'Withholding is money taken from your paycheck in advance toward taxes.',
            choices: [
              { id: 'A', text: 'Tax money taken out before you receive your paycheck', impact: { paycheckLiteracy: 20 } },
              { id: 'B', text: 'Your employer’s retirement contribution', impact: { paycheckLiteracy: 2 } },
              { id: 'C', text: 'The interest rate on your savings account', impact: { paycheckLiteracy: 0 } },
              { id: 'D', text: 'A late fee on a bill', impact: { paycheckLiteracy: 0 } },
            ],
          },
          {
            id: 'q_pay_4',
            title: 'Question 4',
            prompt: 'Which item can reduce taxable income before certain taxes are calculated?',
            correctChoiceId: 'C',
            explanation: 'Eligible pre-tax deductions can reduce taxable income.',
            choices: [
              { id: 'A', text: 'A credit card payment', impact: { paycheckLiteracy: 0 } },
              { id: 'B', text: 'A landlord security deposit', impact: { paycheckLiteracy: 0 } },
              { id: 'C', text: 'A pre-tax deduction', impact: { paycheckLiteracy: 20 } },
              { id: 'D', text: 'A debit card purchase', impact: { paycheckLiteracy: 0 } },
            ],
          },
        ],
      },
      {
        id: 'pay-3',
        heading: 'W-4, pay stubs, and benefit deductions',
        paragraphs: [
          `Your [[W-4]] affects how much federal income tax is withheld. It does not lock in your final tax bill forever, but it does affect take-home pay during the year.`,
          `Your [[Pay Stub]] is where you can verify taxes, health insurance deductions, retirement contributions, and whether your [[Direct Deposit]] amount matches expectations.`
        ],
        bullets: [
          'Two people with the same salary can have different net pay',
          'Benefit elections affect take-home pay',
          'Review your pay stub early to catch errors quickly'
        ],
        questions: [
          {
            id: 'q_pay_5',
            title: 'Question 5',
            prompt: 'Why might two workers with the same salary receive different net pay?',
            correctChoiceId: 'D',
            explanation: 'Different withholding settings and deductions can change take-home pay.',
            choices: [
              { id: 'A', text: 'Salary always determines identical net pay', impact: { paycheckLiteracy: 0 } },
              { id: 'B', text: 'Net pay is random each month', impact: { paycheckLiteracy: 0 } },
              { id: 'C', text: 'Only job title changes paycheck amounts', impact: { paycheckLiteracy: 2 } },
              { id: 'D', text: 'They may have different withholding and benefit deductions', impact: { paycheckLiteracy: 20 } },
            ],
          },
          {
            id: 'q_pay_6',
            title: 'Question 6',
            prompt: 'What is a pay stub used for?',
            correctChoiceId: 'B',
            explanation: 'A pay stub shows gross pay, deductions, taxes, and net pay.',
            choices: [
              { id: 'A', text: 'It is your final tax return', impact: { paycheckLiteracy: 2 } },
              { id: 'B', text: 'It shows how your paycheck was calculated', impact: { paycheckLiteracy: 20 } },
              { id: 'C', text: 'It replaces your bank statement', impact: { paycheckLiteracy: 0 } },
              { id: 'D', text: 'It sets your credit score', impact: { paycheckLiteracy: 0 } },
            ],
          },
        ],
      },
      {
        id: 'pay-4',
        heading: 'Bonuses, RSUs, and taxable compensation',
        paragraphs: [
          `As your career grows, compensation may include bonuses or [[RSU]] grants. These can be exciting, but they also come with tax implications and timing differences.`,
          `A useful habit is separating “stable monthly pay” from “extra compensation.” Do not build fixed obligations around income that is irregular or not fully vested yet.`
        ],
        bullets: [
          'Base pay is better for recurring bills',
          'Variable compensation is not the same as guaranteed cash',
          'Compensation structure matters, not just headline salary'
        ],
        questions: [
          {
            id: 'q_pay_7',
            title: 'Question 7',
            prompt: 'Which type of income is usually least appropriate to rely on for fixed monthly bills?',
            correctChoiceId: 'C',
            explanation: 'Irregular income such as bonuses is less dependable for fixed monthly obligations.',
            choices: [
              { id: 'A', text: 'Consistent base salary', impact: { paycheckLiteracy: 4 } },
              { id: 'B', text: 'Stable net pay from regular payroll', impact: { paycheckLiteracy: 6 } },
              { id: 'C', text: 'Irregular bonus income', impact: { paycheckLiteracy: 20 } },
              { id: 'D', text: 'A known monthly stipend', impact: { paycheckLiteracy: 6 } },
            ],
          },
          {
            id: 'q_pay_8',
            title: 'Question 8',
            prompt: 'What does RSU stand for?',
            correctChoiceId: 'A',
            explanation: 'RSU stands for Restricted Stock Unit.',
            choices: [
              { id: 'A', text: 'Restricted Stock Unit', impact: { paycheckLiteracy: 20, safetyNet: 4 } },
              { id: 'B', text: 'Retirement Savings Upgrade', impact: { paycheckLiteracy: 0 } },
              { id: 'C', text: 'Registered Salary Unit', impact: { paycheckLiteracy: 0 } },
              { id: 'D', text: 'Reduced Spending Utility', impact: { paycheckLiteracy: 0 } },
            ],
          },
        ],
      },
    ],
    takeaway: [
      'Build budgets using net pay, not headline salary.',
      'Understand the difference between taxes, withholding, and FICA.',
      'Review your pay stub early and often.',
      'Treat bonuses and RSUs as less predictable than base pay.'
    ],
  },

  {
    id: 'living',
    title: '2. Living Expenses',
    shortDescription: 'Learn what it actually costs to live on your own.',
    lessonBlocks: [
      {
        id: 'live-1',
        heading: 'Fixed vs variable expenses',
        paragraphs: [
          `As you relocate to a new city and start setting up your place, one of the most useful budget skills is separating [[Fixed Expense]] items from [[Variable Expense]] items.`,
          `Rent is usually fixed for the lease term. Groceries, gas, restaurants, electricity, wifi, and water can all change month to month.`
        ],
        bullets: [
          'Fixed expenses are easier to forecast',
          'Variable expenses require ongoing attention',
          'Utilities are often more volatile than people expect'
        ],
        questions: [
          {
            id: 'q_live_1',
            title: 'Question 1',
            prompt: 'Which of the following is most likely a variable expense?',
            correctChoiceId: 'B',
            explanation: 'Groceries usually change month to month, while rent is typically fixed by lease.',
            choices: [
              { id: 'A', text: 'Rent', impact: { housingBills: 6, spendingControl: 4 } },
              { id: 'B', text: 'Groceries', impact: { spendingControl: 20 } },
              { id: 'C', text: 'Monthly renter insurance premium', impact: { safetyNet: 4 } },
              { id: 'D', text: 'Student loan minimum payment', impact: { creditDebt: 4 } },
            ],
          },
          {
            id: 'q_live_2',
            title: 'Question 2',
            prompt: 'Which category is commonly overlooked in first apartment budgeting?',
            correctChoiceId: 'D',
            explanation: 'Utilities and move-in costs are often missed when people compare rent alone.',
            choices: [
              { id: 'A', text: 'Employer match', impact: { paycheckLiteracy: 0 } },
              { id: 'B', text: 'Credit score inquiries', impact: { creditDebt: 2 } },
              { id: 'C', text: 'Tax withholding', impact: { paycheckLiteracy: 2 } },
              { id: 'D', text: 'Utilities and move-in costs', impact: { housingBills: 20 } },
            ],
          },
        ],
      },
      {
        id: 'live-2',
        heading: 'Renting vs buying and hidden housing costs',
        paragraphs: [
          `For many new grads, renting is more practical than buying. Buying often involves down payment, closing costs, property taxes, maintenance, and less flexibility to move for work.`,
          `When renting, remember that sticker rent is only part of the housing story. [[Security Deposit]], parking, furniture, renter insurance, and commute costs all matter.`
        ],
        bullets: [
          'Cheap rent is not always cheapest overall',
          'Buying has many costs beyond the monthly mortgage',
          'Transportation can change the true cost of a home'
        ],
        questions: [
          {
            id: 'q_live_3',
            title: 'Question 3',
            context: 'You are choosing between two apartments after moving for your first job.',
            prompt: 'Which comparison is strongest?',
            correctChoiceId: 'C',
            explanation: 'A good housing decision compares the full monthly cost, not just advertised rent.',
            choices: [
              { id: 'A', text: 'Choose the lowest rent and ignore commute', impact: { housingBills: 4 } },
              { id: 'B', text: 'Pick the nicest apartment because you deserve it', impact: { housingBills: 2 } },
              { id: 'C', text: 'Compare rent, utilities, commute, and move-in costs together', impact: { housingBills: 20 } },
              { id: 'D', text: 'Choose based only on square footage', impact: { housingBills: 0 } },
            ],
          },
          {
            id: 'q_live_4',
            title: 'Question 4',
            prompt: 'Which cost is more associated with buying than renting?',
            correctChoiceId: 'B',
            explanation: 'Closing costs are a classic home-buying cost.',
            choices: [
              { id: 'A', text: 'Security deposit', impact: { housingBills: 6 } },
              { id: 'B', text: 'Closing costs', impact: { housingBills: 20 } },
              { id: 'C', text: 'Monthly wifi', impact: { housingBills: 2 } },
              { id: 'D', text: 'Renter insurance', impact: { safetyNet: 2 } },
            ],
          },
        ],
      },
      {
        id: 'live-3',
        heading: 'Necessities, lifestyle inflation, and cash flow timing',
        paragraphs: [
          `New grads often underestimate how much convenience spending can creep up. Restaurants, delivery, rideshares, and “small” recurring purchases can compete with necessities if you do not watch them.`,
          `Cash flow timing also matters. Even if your monthly income covers your bills on paper, poor timing can still create overdrafts or late fees.`
        ],
        bullets: [
          'Needs should be funded before wants',
          'Weekly spending checks often work better than month-end surprises',
          'Cash flow timing matters, not just total monthly income'
        ],
        questions: [
          {
            id: 'q_live_5',
            title: 'Question 5',
            prompt: 'What is the strongest first move if restaurant spending keeps exceeding plan?',
            correctChoiceId: 'A',
            explanation: 'A weekly cap plus a simple meal plan creates sustainable control.',
            choices: [
              { id: 'A', text: 'Set a weekly cap and plan a few simple meals', impact: { spendingControl: 20 } },
              { id: 'B', text: 'Ignore it and hope next month is better', impact: { spendingControl: 0 } },
              { id: 'C', text: 'Put food on a credit card and review later', impact: { spendingControl: 2, creditDebt: 2 } },
              { id: 'D', text: 'Stop paying utilities instead', impact: { housingBills: 0 } },
            ],
          },
          {
            id: 'q_live_6',
            title: 'Question 6',
            prompt: 'Which statement is most accurate about cash flow?',
            correctChoiceId: 'D',
            explanation: 'Cash flow timing matters because bills can be due before your next paycheck arrives.',
            choices: [
              { id: 'A', text: 'Only total annual income matters', impact: { spendingControl: 0 } },
              { id: 'B', text: 'Due dates do not matter if your salary is decent', impact: { housingBills: 0 } },
              { id: 'C', text: 'Variable expenses never affect cash flow', impact: { spendingControl: 0 } },
              { id: 'D', text: 'Bill timing can create problems even if monthly income is enough overall', impact: { housingBills: 10, spendingControl: 10 } },
            ],
          },
        ],
      },
      {
        id: 'live-4',
        heading: 'Utilities, subscriptions, and recurring leaks',
        paragraphs: [
          `Electricity, water, internet, and subscriptions are easy to underestimate because each one may feel small in isolation.`,
          `A strong early-career habit is reviewing recurring charges regularly. Small monthly leaks can crowd out savings and emergency fund progress.`
        ],
        bullets: [
          'Recurring charges deserve review',
          'Utilities can fluctuate with season and usage',
          'Tiny leaks can become big annual totals'
        ],
        questions: [
          {
            id: 'q_live_7',
            title: 'Question 7',
            prompt: 'Why are subscriptions often financially dangerous for beginners?',
            correctChoiceId: 'B',
            explanation: 'Their small monthly cost can make them easy to ignore while they add up over time.',
            choices: [
              { id: 'A', text: 'They are always scams', impact: { fraudSafety: 0 } },
              { id: 'B', text: 'They can quietly add up because each one feels small', impact: { spendingControl: 20 } },
              { id: 'C', text: 'They are fixed by law and cannot be cancelled', impact: { spendingControl: 0 } },
              { id: 'D', text: 'They directly lower your credit score', impact: { creditDebt: 2 } },
            ],
          },
          {
            id: 'q_live_8',
            title: 'Question 8',
            prompt: 'Which utility is most likely to vary with weather and usage?',
            correctChoiceId: 'A',
            explanation: 'Electricity bills often change with air conditioning, heating, and seasonal usage.',
            choices: [
              { id: 'A', text: 'Electricity', impact: { housingBills: 12, spendingControl: 8 } },
              { id: 'B', text: 'A fixed parking fee', impact: { housingBills: 4 } },
              { id: 'C', text: 'A closed-end auto loan payment', impact: { creditDebt: 2 } },
              { id: 'D', text: 'A known annual fee card fee', impact: { creditDebt: 2 } },
            ],
          },
        ],
      },
    ],
    takeaway: [
      'Separate fixed and variable expenses clearly.',
      'Compare total housing cost, not rent alone.',
      'Watch cash flow timing, not just monthly totals.',
      'Recurring charges and convenience spending deserve regular review.'
    ],
  },

  {
    id: 'banking',
    title: '3. Banking & Credit Cards',
    shortDescription: 'Use checking, savings, debit, and credit intentionally.',
    lessonBlocks: [
      {
        id: 'bank-1',
        heading: 'Checking, savings, debit, and APY',
        paragraphs: [
          `Your [[Checking Account]] is your operating account. It is where [[Direct Deposit]] lands and where your [[Debit Card]] usually pulls from.`,
          `A [[Savings Account]] is designed for storing money and typically pays more interest, often shown as [[APY]]. That makes it better for reserves than checking.`
        ],
        bullets: [
          'Checking is for transactions',
          'Savings is better for reserves',
          'Higher APY matters more for money you can leave in place'
        ],
        questions: [
          {
            id: 'q_bank_1',
            title: 'Question 1',
            prompt: 'Which account type usually earns more interest?',
            correctChoiceId: 'B',
            explanation: 'Savings accounts generally pay more interest than checking accounts.',
            choices: [
              { id: 'A', text: 'Checking account', impact: { safetyNet: 4 } },
              { id: 'B', text: 'Savings account', impact: { safetyNet: 12, creditDebt: 4 } },
              { id: 'C', text: 'Debit card', impact: { creditDebt: 0 } },
              { id: 'D', text: 'Payroll portal', impact: { paycheckLiteracy: 0 } },
            ],
          },
          {
            id: 'q_bank_2',
            title: 'Question 2',
            prompt: 'What is a debit card linked to?',
            correctChoiceId: 'C',
            explanation: 'A debit card is usually linked to your checking account.',
            choices: [
              { id: 'A', text: 'Your credit report', impact: { creditDebt: 0 } },
              { id: 'B', text: 'Your health insurance plan', impact: { safetyNet: 0 } },
              { id: 'C', text: 'Your checking account', impact: { creditDebt: 6, housingBills: 4 } },
              { id: 'D', text: 'Your employer 401(k)', impact: { paycheckLiteracy: 0 } },
            ],
          },
        ],
      },
      {
        id: 'bank-2',
        heading: 'Overdrafts, due dates, and keeping a buffer',
        paragraphs: [
          `One common early-career mistake is running a checking account too close to zero. An [[Overdraft]] can happen when a transaction exceeds your available balance, potentially triggering fees.`,
          `Keeping a small checking buffer and knowing every bill [[Due Date]] can help prevent avoidable fees.`
        ],
        bullets: [
          'Small buffers prevent expensive mistakes',
          'Bill timing matters',
          'Overdraft fees can quickly compound a shortfall'
        ],
        questions: [
          {
            id: 'q_bank_3',
            title: 'Question 3',
            prompt: 'What is an overdraft?',
            correctChoiceId: 'A',
            explanation: 'An overdraft happens when a transaction exceeds the available account balance.',
            choices: [
              { id: 'A', text: 'A transaction exceeds your available balance', impact: { housingBills: 20 } },
              { id: 'B', text: 'A credit card reward category', impact: { creditDebt: 0 } },
              { id: 'C', text: 'A kind of retirement match', impact: { paycheckLiteracy: 0 } },
              { id: 'D', text: 'A landlord deposit increase', impact: { housingBills: 2 } },
            ],
          },
          {
            id: 'q_bank_4',
            title: 'Question 4',
            prompt: 'What is the best reason to keep a small checking buffer?',
            correctChoiceId: 'D',
            explanation: 'A checking buffer helps reduce the chance of overdrafts or timing-based payment problems.',
            choices: [
              { id: 'A', text: 'It increases your credit limit', impact: { creditDebt: 0 } },
              { id: 'B', text: 'It replaces the need for savings', impact: { safetyNet: 2 } },
              { id: 'C', text: 'It lowers your tax withholding', impact: { paycheckLiteracy: 0 } },
              { id: 'D', text: 'It helps avoid overdrafts and timing problems', impact: { housingBills: 12, spendingControl: 8 } },
            ],
          },
        ],
      },
      {
        id: 'bank-3',
        heading: 'How credit cards work: APR, statement balance, minimum payment',
        paragraphs: [
          `A [[Credit Card]] is useful when managed carefully, but expensive when not. If you do not pay the [[Statement Balance]] in full, interest may be charged based on the [[APR]].`,
          `The [[Minimum Payment]] keeps the account current, but paying only the minimum usually slows debt payoff dramatically.`
        ],
        bullets: [
          'Paying in full avoids most purchase interest',
          'APR matters if you carry a balance',
          'Minimum payment is not the same as healthy repayment'
        ],
        questions: [
          {
            id: 'q_bank_5',
            title: 'Question 5',
            prompt: 'What does APR mean on a credit card?',
            correctChoiceId: 'D',
            explanation: 'APR is the annual percentage cost of borrowing.',
            choices: [
              { id: 'A', text: 'A monthly maintenance charge', impact: { creditDebt: 4 } },
              { id: 'B', text: 'A score assigned by a credit bureau', impact: { creditDebt: 0 } },
              { id: 'C', text: 'A travel reward category', impact: { creditDebt: 0 } },
              { id: 'D', text: 'The annual percentage cost of borrowing', impact: { creditDebt: 20 } },
            ],
          },
          {
            id: 'q_bank_6',
            title: 'Question 6',
            prompt: 'What is the statement balance?',
            correctChoiceId: 'A',
            explanation: 'It is the amount owed at the end of the billing cycle.',
            choices: [
              { id: 'A', text: 'The amount owed at the end of the billing cycle', impact: { creditDebt: 20 } },
              { id: 'B', text: 'Your total available credit', impact: { creditDebt: 4 } },
              { id: 'C', text: 'Your annual fee total for life', impact: { creditDebt: 2 } },
              { id: 'D', text: 'The amount your employer pays to the card issuer', impact: { creditDebt: 0 } },
            ],
          },
        ],
      },
      {
        id: 'bank-4',
        heading: 'Utilization, fees, and choosing your first card',
        paragraphs: [
          `[[Credit Utilization]] is the percentage of your available credit that you are currently using. Many people try to stay below 30% because lower utilization is generally healthier than running close to your limit.`,
          `When comparing cards, think about [[Annual Fee]], rewards, and [[Foreign Transaction Fee]]. The best card is not always the fanciest one.`
        ],
        bullets: [
          'Low utilization is generally better than high utilization',
          'High annual fees require real benefit usage to make sense',
          'Travel fees matter if you expect international spending'
        ],
        questions: [
          {
            id: 'q_bank_7',
            title: 'Question 7',
            prompt: 'If your credit limit is $2,000 and your balance is $800, your utilization is:',
            correctChoiceId: 'C',
            explanation: '800 ÷ 2,000 = 40%.',
            choices: [
              { id: 'A', text: '20%', impact: { creditDebt: 6 } },
              { id: 'B', text: '30%', impact: { creditDebt: 8 } },
              { id: 'C', text: '40%', impact: { creditDebt: 20 } },
              { id: 'D', text: '80%', impact: { creditDebt: 4 } },
            ],
          },
          {
            id: 'q_bank_8',
            title: 'Question 8',
            context: 'You expect to travel internationally for work or vacation.',
            prompt: 'Which fee matters specifically for purchases in another country or currency?',
            correctChoiceId: 'B',
            explanation: 'Foreign transaction fees apply to international or foreign-currency purchases on some cards.',
            choices: [
              { id: 'A', text: 'Security deposit fee', impact: { creditDebt: 0 } },
              { id: 'B', text: 'Foreign transaction fee', impact: { creditDebt: 20 } },
              { id: 'C', text: 'Renter insurance premium', impact: { safetyNet: 0 } },
              { id: 'D', text: 'Payroll withholding fee', impact: { paycheckLiteracy: 0 } },
            ],
          },
        ],
      },
    ],
    takeaway: [
      'Use checking for operations and savings for reserves.',
      'Keep a checking buffer to avoid timing-based fees.',
      'Understand APR, statement balance, and minimum payment before using credit.',
      'Choose cards based on actual use, not flashy benefits alone.'
    ],
  },

  {
    id: 'insurance',
    title: '4. Insurance & Benefits',
    shortDescription: 'Protect yourself from financial shocks and use benefits wisely.',
    lessonBlocks: [
      {
        id: 'ins-1',
        heading: 'Medical insurance basics for first-job adults',
        paragraphs: [
          `Health insurance can feel overwhelming at first, but a few concepts do most of the work: [[Premium]], [[Deductible]], [[Copay]], [[Coinsurance]], and [[Out-of-Pocket Maximum]].`,
          `Cheap monthly premium does not always mean cheap healthcare overall. A plan with a high deductible may cost less now but more later if you need care.`
        ],
        bullets: [
          'Premium is what you pay to keep coverage',
          'Deductible is not the same as copay',
          'Out-of-pocket maximum caps covered yearly spending'
        ],
        questions: [
          {
            id: 'q_ins_1',
            title: 'Question 1',
            prompt: 'What does a deductible mean?',
            correctChoiceId: 'A',
            explanation: 'It is the amount you pay before the insurer starts sharing covered costs.',
            choices: [
              { id: 'A', text: 'The amount you pay before insurance starts sharing costs', impact: { safetyNet: 20 } },
              { id: 'B', text: 'The monthly premium', impact: { safetyNet: 6 } },
              { id: 'C', text: 'The total tax you owe for healthcare', impact: { safetyNet: 0 } },
              { id: 'D', text: 'The provider network list', impact: { safetyNet: 2 } },
            ],
          },
          {
            id: 'q_ins_2',
            title: 'Question 2',
            prompt: 'Which term means the most you pay for covered care in a plan year?',
            correctChoiceId: 'D',
            explanation: 'The out-of-pocket maximum caps your covered yearly spending.',
            choices: [
              { id: 'A', text: 'Copay', impact: { safetyNet: 6 } },
              { id: 'B', text: 'Premium', impact: { safetyNet: 4 } },
              { id: 'C', text: 'Coinsurance', impact: { safetyNet: 8 } },
              { id: 'D', text: 'Out-of-pocket maximum', impact: { safetyNet: 20 } },
            ],
          },
        ],
      },
      {
        id: 'ins-2',
        heading: 'In-network care, trade-offs, and plan selection',
        paragraphs: [
          `[[In-Network]] care usually costs less because your insurer has negotiated rates with those providers.`,
          `As a new grad, a balanced plan is often easier to understand than choosing only by the lowest premium. The right choice depends on expected care usage, cash flow, and risk tolerance.`
        ],
        bullets: [
          'In-network care is usually cheaper',
          'Lowest premium is not always best overall',
          'Coverage should match your financial reality'
        ],
        questions: [
          {
            id: 'q_ins_3',
            title: 'Question 3',
            prompt: 'What does in-network usually mean?',
            correctChoiceId: 'B',
            explanation: 'In-network providers have negotiated prices with your insurer.',
            choices: [
              { id: 'A', text: 'The provider is open on weekends', impact: { safetyNet: 0 } },
              { id: 'B', text: 'The provider has negotiated rates with your insurer', impact: { safetyNet: 20 } },
              { id: 'C', text: 'The visit is always free', impact: { safetyNet: 0 } },
              { id: 'D', text: 'The provider works for your employer', impact: { safetyNet: 0 } },
            ],
          },
          {
            id: 'q_ins_4',
            title: 'Question 4',
            context: 'You are choosing between three plans during benefits enrollment.',
            prompt: 'Which approach is strongest?',
            correctChoiceId: 'C',
            explanation: 'A strong choice compares premium, deductible, and likely usage together.',
            choices: [
              { id: 'A', text: 'Choose the lowest premium without reading anything else', impact: { safetyNet: 4 } },
              { id: 'B', text: 'Choose the most expensive plan automatically', impact: { safetyNet: 8 } },
              { id: 'C', text: 'Compare premium, deductible, and expected care usage', impact: { safetyNet: 20 } },
              { id: 'D', text: 'Skip coverage because you are young', impact: { safetyNet: 0 } },
            ],
          },
        ],
      },
      {
        id: 'ins-3',
        heading: '401(k), employer match, and HSA',
        paragraphs: [
          `A [[401(k)]] is one of the first investing tools many employees encounter. If your employer offers an [[Employer Match]], contributing enough to receive that match can be extremely valuable.`,
          `An [[HSA]] is different: it is tied to eligible health plans and can be used for qualified medical expenses.`
        ],
        bullets: [
          'Employer match is part of compensation',
          '401(k) is for retirement',
          'HSA is for eligible medical expenses under qualifying plans'
        ],
        questions: [
          {
            id: 'q_ins_5',
            title: 'Question 5',
            prompt: 'Which benefit is specifically for retirement saving?',
            correctChoiceId: 'C',
            explanation: 'A 401(k) is an employer-sponsored retirement account.',
            choices: [
              { id: 'A', text: 'Renter insurance', impact: { safetyNet: 2 } },
              { id: 'B', text: 'Copay', impact: { safetyNet: 0 } },
              { id: 'C', text: '401(k)', impact: { safetyNet: 12, paycheckLiteracy: 8 } },
              { id: 'D', text: 'Direct deposit', impact: { paycheckLiteracy: 2 } },
            ],
          },
          {
            id: 'q_ins_6',
            title: 'Question 6',
            prompt: 'What is employer match?',
            correctChoiceId: 'A',
            explanation: 'Employer match is money your employer adds to your retirement account based on your contribution.',
            choices: [
              { id: 'A', text: 'Money your employer adds to your retirement account based on your contribution', impact: { safetyNet: 12, paycheckLiteracy: 8 } },
              { id: 'B', text: 'A health insurance deductible waiver', impact: { safetyNet: 0 } },
              { id: 'C', text: 'A tax refund for commuting to work', impact: { paycheckLiteracy: 0 } },
              { id: 'D', text: 'A bonus paid into your checking account every month', impact: { paycheckLiteracy: 2 } },
            ],
          },
        ],
      },
      {
        id: 'ins-4',
        heading: 'Renter insurance and auto insurance',
        paragraphs: [
          `When you live on your own, insurance is not just about health. [[Renter Insurance]] helps protect your belongings and personal liability, while [[Auto Insurance]] helps cover driving-related risks.`,
          `These products are about transferring the cost of a severe loss you probably could not easily absorb on your own.`
        ],
        bullets: [
          'Renter insurance protects more than just furniture',
          'Auto insurance includes liability concepts as well as vehicle damage coverage',
          'Small premiums can protect against very large losses'
        ],
        questions: [
          {
            id: 'q_ins_7',
            title: 'Question 7',
            context: 'You just moved into your first apartment and bought a laptop and furniture.',
            prompt: 'Which product most directly helps protect your belongings while renting?',
            correctChoiceId: 'B',
            explanation: 'Renter insurance commonly helps cover personal property losses and liability.',
            choices: [
              { id: 'A', text: 'Auto insurance', impact: { safetyNet: 2 } },
              { id: 'B', text: 'Renter insurance', impact: { safetyNet: 20 } },
              { id: 'C', text: 'A checking account', impact: { safetyNet: 0 } },
              { id: 'D', text: 'Credit freeze', impact: { fraudSafety: 2 } },
            ],
          },
          {
            id: 'q_ins_8',
            title: 'Question 8',
            prompt: 'Why do people buy insurance in general?',
            correctChoiceId: 'D',
            explanation: 'Insurance helps protect against losses that would be financially difficult to absorb alone.',
            choices: [
              { id: 'A', text: 'To guarantee profit', impact: { safetyNet: 0 } },
              { id: 'B', text: 'To avoid all spending', impact: { safetyNet: 0 } },
              { id: 'C', text: 'To increase credit score', impact: { creditDebt: 0 } },
              { id: 'D', text: 'To reduce the impact of large financial losses', impact: { safetyNet: 20 } },
            ],
          },
        ],
      },
    ],
    takeaway: [
      'Insurance choices should balance monthly cost and potential risk.',
      'Understand premium, deductible, copay, and out-of-pocket maximum.',
      'Employer match can be one of the highest-value benefits available.',
      'Renter and auto insurance protect against losses most beginners cannot easily absorb.'
    ],
  },

  {
    id: 'emergency',
    title: '5. Emergency Fund',
    shortDescription: 'Build resilience before life tests your budget.',
    lessonBlocks: [
      {
        id: 'em-1',
        heading: 'What an emergency fund is for',
        paragraphs: [
          `As an early-career worker living independently, surprises hit harder because you may have fewer financial buffers. A broken laptop, urgent flight home, medical cost, or job interruption can quickly become debt without an [[Emergency Fund]].`,
          `Emergency savings are for urgent, necessary costs — not for convenience spending or planned fun.`
        ],
        bullets: [
          'Emergency = urgent and necessary',
          'Emergency savings help reduce dependence on credit',
          'The point is resilience, not perfection'
        ],
        questions: [
          {
            id: 'q_em_1',
            title: 'Question 1',
            prompt: 'Which is the best example of an emergency fund use?',
            correctChoiceId: 'C',
            explanation: 'Unexpected essential repairs are exactly what emergency savings are for.',
            choices: [
              { id: 'A', text: 'A concert weekend', impact: { spendingControl: 0 } },
              { id: 'B', text: 'A new phone color preference', impact: { spendingControl: 0 } },
              { id: 'C', text: 'An unexpected car repair', impact: { safetyNet: 20 } },
              { id: 'D', text: 'Holiday shopping', impact: { spendingControl: 0 } },
            ],
          },
          {
            id: 'q_em_2',
            title: 'Question 2',
            prompt: 'What is the main purpose of an emergency fund?',
            correctChoiceId: 'B',
            explanation: 'Its purpose is to cover urgent, unexpected expenses without automatically creating debt.',
            choices: [
              { id: 'A', text: 'To replace your checking account', impact: { safetyNet: 2 } },
              { id: 'B', text: 'To cover urgent, unexpected expenses', impact: { safetyNet: 20 } },
              { id: 'C', text: 'To maximize investment returns', impact: { safetyNet: 4 } },
              { id: 'D', text: 'To fund annual vacations', impact: { spendingControl: 0 } },
            ],
          },
        ],
      },
      {
        id: 'em-2',
        heading: 'How much to save and what counts as essential expenses',
        paragraphs: [
          `A common rule of thumb is 3–6 months of essential expenses, not total lifestyle spending. Essentials often mean rent, food, utilities, transportation, insurance, and minimum debt payments.`,
          `If that target feels large, start with a smaller milestone. Even one month or a starter cushion can reduce risk meaningfully.`
        ],
        bullets: [
          'Essential expenses are different from total discretionary spending',
          'A starter fund is better than waiting for the perfect number',
          'Targets can scale as income rises'
        ],
        questions: [
          {
            id: 'q_em_3',
            title: 'Question 3',
            prompt: 'A common guideline for emergency savings is:',
            correctChoiceId: 'B',
            explanation: 'Many guidelines suggest 3–6 months of essential expenses.',
            choices: [
              { id: 'A', text: '1 week of expenses', impact: { safetyNet: 4 } },
              { id: 'B', text: '3–6 months of essential expenses', impact: { safetyNet: 20 } },
              { id: 'C', text: 'Exactly 2 years of total spending', impact: { safetyNet: 4 } },
              { id: 'D', text: 'Whatever your annual bonus happens to be', impact: { safetyNet: 2 } },
            ],
          },
          {
            id: 'q_em_4',
            title: 'Question 4',
            prompt: 'Which category is most likely part of essential expenses?',
            correctChoiceId: 'A',
            explanation: 'Rent is a classic essential expense.',
            choices: [
              { id: 'A', text: 'Rent', impact: { safetyNet: 10, housingBills: 10 } },
              { id: 'B', text: 'Luxury concert travel', impact: { safetyNet: 0 } },
              { id: 'C', text: 'Premium streaming upgrades', impact: { spendingControl: 2 } },
              { id: 'D', text: 'Designer shopping', impact: { spendingControl: 0 } },
            ],
          },
        ],
      },
      {
        id: 'em-3',
        heading: 'Where to keep the money: liquidity over excitement',
        paragraphs: [
          `Emergency cash usually belongs somewhere stable and accessible, such as a savings account. [[Liquidity]] matters more here than chasing the highest possible return.`,
          `The role of emergency money is not to outperform the market. The role is to be available when real life happens.`
        ],
        bullets: [
          'Accessibility matters',
          'Volatility can be dangerous for money you may need suddenly',
          'Savings account use is about stability, not excitement'
        ],
        questions: [
          {
            id: 'q_em_5',
            title: 'Question 5',
            prompt: 'Why is liquidity important for emergency funds?',
            correctChoiceId: 'D',
            explanation: 'Emergency money should be easy to access quickly without major loss of value.',
            choices: [
              { id: 'A', text: 'It increases your credit score', impact: { creditDebt: 0 } },
              { id: 'B', text: 'It guarantees higher stock returns', impact: { safetyNet: 0 } },
              { id: 'C', text: 'It lowers your tax withholding', impact: { paycheckLiteracy: 0 } },
              { id: 'D', text: 'It lets you access the money quickly when needed', impact: { safetyNet: 20 } },
            ],
          },
          {
            id: 'q_em_6',
            title: 'Question 6',
            prompt: 'Which place is generally better for emergency cash than a volatile stock position?',
            correctChoiceId: 'B',
            explanation: 'A savings account is usually more stable and accessible than volatile investments.',
            choices: [
              { id: 'A', text: 'A single speculative stock', impact: { safetyNet: 0 } },
              { id: 'B', text: 'A savings account', impact: { safetyNet: 20 } },
              { id: 'C', text: 'A random crypto token', impact: { safetyNet: 0 } },
              { id: 'D', text: 'A luxury watch purchase', impact: { safetyNet: 0 } },
            ],
          },
        ],
      },
      {
        id: 'em-4',
        heading: 'Emergency savings vs insurance',
        paragraphs: [
          `Emergency funds and insurance work together. Savings help with immediate cash needs, while insurance reduces the scale of certain losses.`,
          `A resilient plan usually uses both: some liquid savings plus appropriate insurance coverage.`
        ],
        bullets: [
          'Savings handle cash flow shocks',
          'Insurance handles certain high-cost risks',
          'Neither one fully replaces the other'
        ],
        questions: [
          {
            id: 'q_em_7',
            title: 'Question 7',
            prompt: 'Which statement is most accurate?',
            correctChoiceId: 'C',
            explanation: 'Emergency savings and insurance solve different parts of the risk problem.',
            choices: [
              { id: 'A', text: 'Insurance removes the need for any emergency fund', impact: { safetyNet: 2 } },
              { id: 'B', text: 'An emergency fund removes the need for insurance', impact: { safetyNet: 2 } },
              { id: 'C', text: 'Savings and insurance play different protective roles', impact: { safetyNet: 20 } },
              { id: 'D', text: 'Neither one matters if your salary is decent', impact: { safetyNet: 0 } },
            ],
          },
          {
            id: 'q_em_8',
            title: 'Question 8',
            prompt: 'Which is the strongest beginner strategy?',
            correctChoiceId: 'A',
            explanation: 'A starter emergency fund plus core insurance creates a stronger base than relying on one tool alone.',
            choices: [
              { id: 'A', text: 'Build starter emergency savings while keeping core insurance coverage', impact: { safetyNet: 20 } },
              { id: 'B', text: 'Skip savings and rely only on credit cards', impact: { safetyNet: 0, creditDebt: 2 } },
              { id: 'C', text: 'Skip insurance and hope emergencies do not happen', impact: { safetyNet: 0 } },
              { id: 'D', text: 'Invest all cash and assume you can sell anytime', impact: { safetyNet: 4 } },
            ],
          },
        ],
      },
    ],
    takeaway: [
      'Emergency funds are for urgent, necessary expenses.',
      'A 3–6 month guideline is common, but even a starter fund helps.',
      'Keep emergency cash liquid and stable.',
      'Savings and insurance work best together.'
    ],
  },

  {
    id: 'fraud',
    title: '6. Fraud & Scams',
    shortDescription: 'Protect your identity, accounts, and credit profile.',
    lessonBlocks: [
      {
        id: 'fraud-1',
        heading: 'Phishing and urgency traps',
        paragraphs: [
          `Scams often work because they feel urgent. A fake payroll issue, fake bank alert, or fake package notice can pressure you into clicking before thinking. That is the core of [[Phishing]].`,
          `A strong habit is to distrust the message itself and instead go directly to the known official app, portal, or phone number.`
        ],
        bullets: [
          'Urgency is a common scam tactic',
          'Official-looking design does not prove authenticity',
          'Go to trusted channels directly'
        ],
        questions: [
          {
            id: 'q_fr_1',
            title: 'Question 1',
            context: 'You receive an email saying your payroll details must be updated immediately through a link in the message.',
            prompt: 'What is the safest first response?',
            correctChoiceId: 'D',
            explanation: 'The safest move is to use the official payroll portal directly, not the link in the suspicious email.',
            choices: [
              { id: 'A', text: 'Click quickly to avoid payroll delays', impact: { fraudSafety: 0 } },
              { id: 'B', text: 'Reply with bank details for faster processing', impact: { fraudSafety: 0 } },
              { id: 'C', text: 'Forward it to friends for opinions', impact: { fraudSafety: 4 } },
              { id: 'D', text: 'Go directly to the official HR/payroll portal', impact: { fraudSafety: 20 } },
            ],
          },
          {
            id: 'q_fr_2',
            title: 'Question 2',
            prompt: 'Which is a classic phishing red flag?',
            correctChoiceId: 'B',
            explanation: 'Urgency and pressure are common phishing tactics.',
            choices: [
              { id: 'A', text: 'A bill due date listed in your own budgeting app', impact: { fraudSafety: 2 } },
              { id: 'B', text: 'An urgent warning pushing immediate action through a link', impact: { fraudSafety: 20 } },
              { id: 'C', text: 'A scheduled employer benefits reminder in your HR portal', impact: { fraudSafety: 2 } },
              { id: 'D', text: 'A known bank statement available in your official app', impact: { fraudSafety: 2 } },
            ],
          },
        ],
      },
      {
        id: 'fraud-2',
        heading: 'Identity theft and the role of credit freezes',
        paragraphs: [
          `[[Identity Theft]] can lead to fake new accounts, credit damage, and a lot of cleanup work. A [[Credit Freeze]] can help reduce the chance that someone opens new credit in your name.`,
          `The three major credit bureaus are [[Equifax]], [[Experian]], and [[TransUnion]]. Knowing these names matters when responding to fraud.`
        ],
        bullets: [
          'Credit freezes help block fraudulent new credit applications',
          'A freeze does not erase existing debt',
          'You generally manage freezes bureau by bureau'
        ],
        questions: [
          {
            id: 'q_fr_3',
            title: 'Question 3',
            prompt: 'What is the main purpose of a credit freeze?',
            correctChoiceId: 'A',
            explanation: 'A credit freeze restricts access to your credit report to help prevent fraudulent new accounts.',
            choices: [
              { id: 'A', text: 'Restrict access to your credit report', impact: { fraudSafety: 20 } },
              { id: 'B', text: 'Increase your score immediately', impact: { fraudSafety: 0 } },
              { id: 'C', text: 'Delete old debt', impact: { fraudSafety: 0 } },
              { id: 'D', text: 'Stop all checking account withdrawals', impact: { fraudSafety: 2 } },
            ],
          },
          {
            id: 'q_fr_4',
            title: 'Question 4',
            prompt: 'Which of the following is NOT one of the three major U.S. credit bureaus?',
            correctChoiceId: 'D',
            explanation: 'FICO is a scoring model company, not one of the three major credit bureaus.',
            choices: [
              { id: 'A', text: 'Equifax', impact: { fraudSafety: 6 } },
              { id: 'B', text: 'Experian', impact: { fraudSafety: 6 } },
              { id: 'C', text: 'TransUnion', impact: { fraudSafety: 6 } },
              { id: 'D', text: 'FICO', impact: { fraudSafety: 20 } },
            ],
          },
        ],
      },
      {
        id: 'fraud-3',
        heading: 'Practical protection habits',
        paragraphs: [
          `Fraud prevention is not only about recognizing scams. It is also about keeping your systems clean: unique passwords, device updates, bank alerts, and fast reporting if something looks wrong.`,
          `The earlier you react to suspicious activity, the easier it usually is to contain the damage.`
        ],
        bullets: [
          'Fast reporting matters',
          'Account monitoring is part of financial literacy',
          'Prevention habits reduce stress later'
        ],
        questions: [
          {
            id: 'q_fr_5',
            title: 'Question 5',
            prompt: 'Why is quick reporting of suspicious account activity important?',
            correctChoiceId: 'C',
            explanation: 'Fast reporting can help reduce losses and limit damage.',
            choices: [
              { id: 'A', text: 'It always raises your credit score', impact: { fraudSafety: 0 } },
              { id: 'B', text: 'It automatically recovers every dollar immediately', impact: { fraudSafety: 2 } },
              { id: 'C', text: 'It can help contain damage sooner', impact: { fraudSafety: 20 } },
              { id: 'D', text: 'It is only relevant for wealthy people', impact: { fraudSafety: 0 } },
            ],
          },
          {
            id: 'q_fr_6',
            title: 'Question 6',
            prompt: 'Which habit most directly supports account security?',
            correctChoiceId: 'A',
            explanation: 'Using strong unique passwords is a foundational security habit.',
            choices: [
              { id: 'A', text: 'Using strong, unique passwords', impact: { fraudSafety: 20 } },
              { id: 'B', text: 'Using the same password everywhere for convenience', impact: { fraudSafety: 0 } },
              { id: 'C', text: 'Ignoring bank alerts until the weekend', impact: { fraudSafety: 0 } },
              { id: 'D', text: 'Sharing login credentials with friends you trust', impact: { fraudSafety: 0 } },
            ],
          },
        ],
      },
      {
        id: 'fraud-4',
        heading: 'Credit bureau literacy for recovery',
        paragraphs: [
          `If identity theft affects credit applications, bureau knowledge becomes practical, not theoretical. [[Experian]], [[Equifax]], and [[TransUnion]] are the places many fraud-response steps involve.`,
          `That is why fraud literacy is part of financial literacy: protecting access to future housing, loans, and even some job-related checks.`
        ],
        bullets: [
          'Credit bureau knowledge supports fraud response',
          'Fraud can affect future borrowing and housing',
          'Protection is part of long-term financial stability'
        ],
        questions: [
          {
            id: 'q_fr_7',
            title: 'Question 7',
            prompt: 'Why does credit fraud matter beyond just one stolen card?',
            correctChoiceId: 'B',
            explanation: 'Identity-related fraud can affect future credit access and financial opportunities.',
            choices: [
              { id: 'A', text: 'Because it only changes your bank app theme', impact: { fraudSafety: 0 } },
              { id: 'B', text: 'Because it can damage future credit access and financial options', impact: { fraudSafety: 20 } },
              { id: 'C', text: 'Because it automatically cancels your job contract', impact: { fraudSafety: 2 } },
              { id: 'D', text: 'Because it eliminates tax withholding', impact: { paycheckLiteracy: 0 } },
            ],
          },
          {
            id: 'q_fr_8',
            title: 'Question 8',
            prompt: 'Which trio lists the major U.S. credit bureaus correctly?',
            correctChoiceId: 'A',
            explanation: 'Experian, Equifax, and TransUnion are the three major U.S. credit bureaus.',
            choices: [
              { id: 'A', text: 'Experian, Equifax, TransUnion', impact: { fraudSafety: 20 } },
              { id: 'B', text: 'FICO, APY, APR', impact: { fraudSafety: 0 } },
              { id: 'C', text: 'Visa, Mastercard, Discover', impact: { fraudSafety: 2 } },
              { id: 'D', text: 'IRS, SSA, FHA', impact: { fraudSafety: 0 } },
            ],
          },
        ],
      },
    ],
    takeaway: [
      'Urgency is one of the biggest scam red flags.',
      'Use official channels directly instead of trusting suspicious links.',
      'Credit freezes can help prevent fraudulent new accounts.',
      'Fraud literacy protects future borrowing, housing, and financial stability.'
    ],
  },

  {
    id: 'investing',
    title: '7. Investing Basics',
    shortDescription: 'Know the common tools early-career workers encounter.',
    lessonBlocks: [
      {
        id: 'inv-1',
        heading: 'Starting with workplace investing',
        paragraphs: [
          `For many new grads, investing begins at work. A [[401(k)]] can help build retirement savings, and an [[Employer Match]] can add extra money if you contribute enough to receive it.`,
          `This is different from ordinary saving. Savings is about stability and access; investing is about long-term growth with risk.`
        ],
        bullets: [
          '401(k) is for retirement, not emergency cash',
          'Employer match increases benefit value',
          'Long-term tools should match long-term goals'
        ],
        questions: [
          {
            id: 'q_inv_1',
            title: 'Question 1',
            prompt: 'Which account is specifically designed for retirement saving through an employer?',
            correctChoiceId: 'C',
            explanation: 'A 401(k) is an employer-sponsored retirement account.',
            choices: [
              { id: 'A', text: 'Checking account', impact: { safetyNet: 0 } },
              { id: 'B', text: 'Renter insurance policy', impact: { safetyNet: 0 } },
              { id: 'C', text: '401(k)', impact: { safetyNet: 12, paycheckLiteracy: 8 } },
              { id: 'D', text: 'Security deposit', impact: { housingBills: 0 } },
            ],
          },
          {
            id: 'q_inv_2',
            title: 'Question 2',
            prompt: 'What is employer match?',
            correctChoiceId: 'B',
            explanation: 'It is money your employer contributes to your retirement account based on your contribution.',
            choices: [
              { id: 'A', text: 'A refund on your rent', impact: { housingBills: 0 } },
              { id: 'B', text: 'Money your employer contributes based on your retirement contribution', impact: { safetyNet: 12, paycheckLiteracy: 8 } },
              { id: 'C', text: 'A credit card rewards feature', impact: { creditDebt: 0 } },
              { id: 'D', text: 'A tax on bonus pay', impact: { paycheckLiteracy: 0 } },
            ],
          },
        ],
      },
      {
        id: 'inv-2',
        heading: 'HSA, CDs, and what account type means',
        paragraphs: [
          `An [[HSA]] can be useful for eligible medical expenses, but it is tied to qualifying health plans. It is not the same as a normal savings account.`,
          `A [[Certificate of Deposit]] is a bank product with a fixed term and usually a fixed interest rate. It is different from stocks or mutual funds.`
        ],
        bullets: [
          'Account type matters as much as investment choice',
          'CDs are deposit products, not stocks',
          'HSA rules depend on health plan eligibility'
        ],
        questions: [
          {
            id: 'q_inv_3',
            title: 'Question 3',
            prompt: 'What does HSA stand for?',
            correctChoiceId: 'D',
            explanation: 'HSA stands for Health Savings Account.',
            choices: [
              { id: 'A', text: 'High Savings Allocation', impact: { safetyNet: 0 } },
              { id: 'B', text: 'Household Spending Account', impact: { spendingControl: 0 } },
              { id: 'C', text: 'Health Security Allocation', impact: { safetyNet: 2 } },
              { id: 'D', text: 'Health Savings Account', impact: { safetyNet: 20 } },
            ],
          },
          {
            id: 'q_inv_4',
            title: 'Question 4',
            prompt: 'A Certificate of Deposit is best described as:',
            correctChoiceId: 'A',
            explanation: 'A CD is a bank deposit product with a fixed term and usually a fixed interest rate.',
            choices: [
              { id: 'A', text: 'A bank deposit product with a fixed term and interest rate', impact: { safetyNet: 20 } },
              { id: 'B', text: 'A company stock grant', impact: { paycheckLiteracy: 0 } },
              { id: 'C', text: 'A payroll tax form', impact: { paycheckLiteracy: 0 } },
              { id: 'D', text: 'A type of insurance deductible', impact: { safetyNet: 0 } },
            ],
          },
        ],
      },
      {
        id: 'inv-3',
        heading: 'Stocks, RSUs, funds, and diversification',
        paragraphs: [
          `Some compensation packages include [[RSU]] grants. That can be valuable, but it also concentrates more of your finances in one company if you already work there.`,
          `A [[Fund]] can spread money across many investments. That is where [[Diversification]] becomes useful: it reduces dependence on a single company or sector.`
        ],
        bullets: [
          'Employer stock can create concentration risk',
          'Funds often provide broader exposure than single stocks',
          'Diversification is a risk-management concept'
        ],
        questions: [
          {
            id: 'q_inv_5',
            title: 'Question 5',
            prompt: 'What does RSU stand for?',
            correctChoiceId: 'B',
            explanation: 'RSU stands for Restricted Stock Unit.',
            choices: [
              { id: 'A', text: 'Retirement Savings Unit', impact: { paycheckLiteracy: 2 } },
              { id: 'B', text: 'Restricted Stock Unit', impact: { paycheckLiteracy: 12, safetyNet: 8 } },
              { id: 'C', text: 'Recurring Savings Utility', impact: { paycheckLiteracy: 0 } },
              { id: 'D', text: 'Registered Salary Upgrade', impact: { paycheckLiteracy: 0 } },
            ],
          },
          {
            id: 'q_inv_6',
            title: 'Question 6',
            prompt: 'Which choice is usually the most diversified?',
            correctChoiceId: 'D',
            explanation: 'A broad fund usually holds many investments, unlike a single stock.',
            choices: [
              { id: 'A', text: 'One individual stock', impact: { safetyNet: 2 } },
              { id: 'B', text: 'Only your employer stock', impact: { safetyNet: 0 } },
              { id: 'C', text: 'Only one industry leader', impact: { safetyNet: 2 } },
              { id: 'D', text: 'A broad market fund', impact: { safetyNet: 12, paycheckLiteracy: 4 } },
            ],
          },
        ],
      },
      {
        id: 'inv-4',
        heading: 'Matching tools to goals',
        paragraphs: [
          `A useful mental model is to match the tool to the goal. Emergency cash needs liquidity. Near-term goals may need stability. Long-term goals can usually tolerate more risk.`,
          `That is why new grads benefit from understanding the difference between short-term cash tools and long-term growth tools.`
        ],
        bullets: [
          'Match the product to the job',
          'Do not treat emergency cash like long-term investment money',
          'Time horizon changes what makes sense'
        ],
        questions: [
          {
            id: 'q_inv_7',
            title: 'Question 7',
            prompt: 'Which tool is usually more appropriate for emergency cash than long-term stock exposure?',
            correctChoiceId: 'C',
            explanation: 'Emergency cash is usually better kept in stable, accessible accounts rather than volatile investments.',
            choices: [
              { id: 'A', text: 'A single growth stock', impact: { safetyNet: 0 } },
              { id: 'B', text: 'Only employer RSUs', impact: { safetyNet: 0 } },
              { id: 'C', text: 'A savings account or similar stable cash vehicle', impact: { safetyNet: 20 } },
              { id: 'D', text: 'A highly concentrated tech bet', impact: { safetyNet: 0 } },
            ],
          },
          {
            id: 'q_inv_8',
            title: 'Question 8',
            prompt: 'Why is diversification useful?',
            correctChoiceId: 'A',
            explanation: 'Diversification helps reduce dependence on one investment or one company.',
            choices: [
              { id: 'A', text: 'It reduces concentration risk', impact: { safetyNet: 20 } },
              { id: 'B', text: 'It guarantees profits every year', impact: { safetyNet: 0 } },
              { id: 'C', text: 'It removes all market risk', impact: { safetyNet: 0 } },
              { id: 'D', text: 'It replaces the need for an emergency fund', impact: { safetyNet: 0 } },
            ],
          },
        ],
      },
    ],
    takeaway: [
      'Workplace investing often begins with a 401(k) and employer match.',
      'Account type matters: HSA, CD, and investment funds serve different purposes.',
      'RSUs can be valuable but may increase concentration risk.',
      'Diversification helps reduce reliance on one company or asset.'
    ],
  },
];

function flattenQuestions(modules: Module[]) {
  return modules.flatMap(module =>
    module.lessonBlocks.flatMap(block => block.questions)
  );
}

function clampScore(n: number) {
  return Math.max(0, Math.min(100, n));
}

function computeScoresFromAnswers(answers: Record<string, string>): Scores {
  const base: Scores = {
    paycheckLiteracy: 0,
    housingBills: 0,
    spendingControl: 0,
    creditDebt: 0,
    safetyNet: 0,
    fraudSafety: 0,
  };

  const maxPoints: Record<SkillKey, number> = {
    paycheckLiteracy: 0,
    housingBills: 0,
    spendingControl: 0,
    creditDebt: 0,
    safetyNet: 0,
    fraudSafety: 0,
  };

  for (const module of MODULES) {
    for (const block of module.lessonBlocks) {
      for (const q of block.questions) {
        const skillsTouched = new Set<SkillKey>();
        q.choices.forEach(choice => {
          Object.keys(choice.impact).forEach(key => skillsTouched.add(key as SkillKey));
        });

        skillsTouched.forEach(skill => {
          const best = Math.max(...q.choices.map(c => c.impact[skill] ?? 0));
          maxPoints[skill] += best;
        });

        const chosenId = answers[q.id];
        if (!chosenId) continue;

        const chosen = q.choices.find(c => c.id === chosenId);
        if (!chosen) continue;

        for (const [skill, pts] of Object.entries(chosen.impact) as [SkillKey, number][]) {
          base[skill] += pts;
        }
      }
    }
  }

  const normalized = { ...base };
  (Object.keys(normalized) as SkillKey[]).forEach(skill => {
    const denom = maxPoints[skill] || 1;
    normalized[skill] = clampScore(Math.round((base[skill] / denom) * 100));
  });

  return normalized;
}

function benchmarkLabel(score: number) {
  if (score >= 80) return { label: 'Rock Solid', tone: 'var(--color-primary)' };
  if (score >= 60) return { label: 'Strong', tone: 'var(--color-accent)' };
  if (score >= 40) return { label: 'Getting There', tone: 'var(--color-text)' };
  return { label: 'Needs a Boost', tone: 'var(--color-text-muted)' };
}

function renderTextWithTooltips(
  text: string,
  onTermClick: (term: string) => void
) {
  const parts = text.split(/(\[\[[^[\]]+\]\])/g);

  return parts.map((part, idx) => {
    const match = part.match(/^\[\[([^[\]]+)\]\]$/);
    if (match) {
      const term = match[1];
      return (
        <button
          key={`${term}-${idx}`}
          type="button"
          onClick={() => onTermClick(term)}
          className="underline decoration-dotted underline-offset-4 font-medium"
          style={{ color: 'var(--color-primary)' }}
        >
          {term}
        </button>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export default function TechnicalQuestionPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const radarShareRef = useRef<HTMLDivElement | null>(null);

  const allQuestions = useMemo(() => flattenQuestions(MODULES), []);
  const totalQuestions = allQuestions.length;

  const [user, setUser] = useState<any>(null);
  const [activeModuleId, setActiveModuleId] = useState<string>(MODULES[0].id);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [glossaryTerm, setGlossaryTerm] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }
      setUser(user);
    };
    checkUser();
  }, [locale, router, supabase]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // use 'auto' if you want no animation
    });
  }, [activeModuleId]);

  const scores = useMemo(() => computeScoresFromAnswers(answers), [answers]);
  const answeredQuestions = Object.keys(revealed).length;
  const allAnswered = answeredQuestions === totalQuestions;

  const activeModule = MODULES.find(m => m.id === activeModuleId) ?? MODULES[0];

  const moduleStats = (module: Module) => {
    const questions = module.lessonBlocks.flatMap(b => b.questions);
    const revealedCount = questions.filter(q => revealed[q.id]).length;
    return {
      revealedCount,
      total: questions.length,
      complete: revealedCount === questions.length
    };
  };

  const setAnswer = (questionId: string, choiceId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: choiceId }));
    setRevealed(prev => ({ ...prev, [questionId]: true }));
  };

  const getShareMeta = () => ({
    filename: `financial-literacy-radar-${Date.now()}.png`,
    shareTitle: 'My Financial Literacy Radar',
    shareText: 'I just completed a financial literacy course and got my radar results. Check yours too!',
    shareUrl: typeof window !== 'undefined' ? window.location.href : '',
  });

  const handleShare = async () => {
    if (!radarShareRef.current) return;

    const meta = getShareMeta();
    await nativeShareElement(radarShareRef.current, {
      filename: meta.filename,
      shareTitle: meta.shareTitle,
      shareText: meta.shareText,
      shareUrl: meta.shareUrl,
    });
  };

  const handleDownload = async () => {
    if (!radarShareRef.current) return;

    const meta = getShareMeta();
    await downloadElementAsImage(radarShareRef.current, meta.filename);
  };

  const handleShareLink = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    await copyShareLink(shareUrl);
  };

  const handleShareX = () => {
    const meta = getShareMeta();
    shareToX({
      gradientColors: ['#2563eb', '#1e40af'],
      circleColor1: 'rgba(255, 255, 255, 0.05)',
      circleColor2: 'rgba(255, 255, 255, 0.08)',
      mascot: '📊',
      title: 'My Financial Literacy Radar',
      subtitle: 'New Grad Edition',
      brandText: 'See how I scored across core money skills',
      filename: meta.filename,
      shareTitle: meta.shareTitle,
      shareText: meta.shareText,
      shareUrl: meta.shareUrl,
    });
  };

  const handleShareFacebook = () => {
    const meta = getShareMeta();
    shareToFacebook({
      gradientColors: ['#2563eb', '#1e40af'],
      circleColor1: 'rgba(255, 255, 255, 0.05)',
      circleColor2: 'rgba(255, 255, 255, 0.08)',
      mascot: '📊',
      title: 'My Financial Literacy Radar',
      subtitle: 'New Grad Edition',
      brandText: 'See how I scored across core money skills',
      filename: meta.filename,
      shareTitle: meta.shareTitle,
      shareText: meta.shareText,
      shareUrl: meta.shareUrl,
    });
  };

  const tocItems = [
    ...MODULES.map(m => ({
      id: m.id,
      title: m.title,
      unlocked: true
    })),
    {
      id: 'results',
      title: '8. Results',
      unlocked: allAnswered
    }
  ];

  return (
    <div className="min-h-screen p-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            Financial Literacy Course
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Learn the practical money knowledge most new grads wish they had on day one, then test yourself immediately after each section.
          </p>
        </div>

        <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-8 items-start">
          <aside
            className="rounded-2xl shadow-lg p-5 lg:sticky lg:top-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderWidth: '1px',
              borderColor: 'var(--color-neutral-200)'
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Course Modules
            </h2>

            <div className="space-y-2">
              {tocItems.map(item => {
                const isActive = activeModuleId === item.id;
                const module = MODULES.find(m => m.id === item.id);
                const completion = module ? moduleStats(module) : null;

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!item.unlocked}
                    onClick={() => item.unlocked && setActiveModuleId(item.id)}
                    className="w-full text-left px-4 py-3 rounded-xl border transition"
                    style={{
                      backgroundColor: isActive ? 'var(--color-background)' : 'transparent',
                      borderColor: isActive ? 'var(--color-primary)' : 'var(--color-neutral-300)',
                      color: item.unlocked ? 'var(--color-text)' : 'var(--color-text-muted)',
                      opacity: item.unlocked ? 1 : 0.55,
                      cursor: item.unlocked ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <div className="font-semibold">{item.title}</div>
                    {module && (
                      <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        {completion?.revealedCount}/{completion?.total} questions completed
                      </div>
                    )}
                    {item.id === 'results' && !item.unlocked && (
                      <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Finish all questions to unlock
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div
              className="mt-6 p-4 rounded-xl"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <div className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Overall Progress
              </div>
              <div className="w-full h-2 rounded-lg mb-2" style={{ backgroundColor: 'var(--color-neutral-200)' }}>
                <div
                  className="h-2 rounded-lg"
                  style={{
                    width: `${Math.round((answeredQuestions / totalQuestions) * 100)}%`,
                    backgroundColor: 'var(--color-primary)'
                  }}
                />
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {answeredQuestions}/{totalQuestions} questions completed
              </div>
            </div>
          </aside>

          <main
            className="rounded-2xl shadow-lg p-8 min-h-[700px]"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderWidth: '1px',
              borderColor: 'var(--color-neutral-200)'
            }}
          >
            {activeModuleId !== 'results' ? (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                    {activeModule.title}
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    {activeModule.shortDescription}
                  </p>
                </div>

                <section className="space-y-10">
                  {activeModule.lessonBlocks.map((block, blockIndex) => (
                    <div key={block.id} className="space-y-5">
                      <div>
                        <h3 className="text-2xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                          {block.heading}
                        </h3>

                        <div className="space-y-3">
                          {block.paragraphs.map((paragraph, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl leading-7"
                              style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                            >
                              {renderTextWithTooltips(paragraph, setGlossaryTerm)}
                            </div>
                          ))}
                        </div>

                        {block.bullets && (
                          <div
                            className="mt-4 p-4 rounded-xl"
                            style={{ backgroundColor: 'var(--color-background)' }}
                          >
                            <div className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                              Key ideas
                            </div>
                            <ul className="space-y-2 pl-5 list-disc" style={{ color: 'var(--color-text-secondary)' }}>
                              {block.bullets.map((bullet, idx) => (
                                <li key={idx}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="space-y-5">
                        <h4 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                          Quick Check
                        </h4>

                        {block.questions.map((q, idx) => {
                          const chosen = answers[q.id];
                          const isRevealed = !!revealed[q.id];

                          return (
                            <div
                              key={q.id}
                              className="p-5 rounded-xl border"
                              style={{
                                borderColor: 'var(--color-neutral-300)',
                                backgroundColor: 'var(--color-background)'
                              }}
                            >
                              <div className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                {block.heading} · Question {idx + 1}
                              </div>

                              {q.context && (
                                <div
                                  className="mb-3 p-3 rounded-lg"
                                  style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}
                                >
                                  {q.context}
                                </div>
                              )}

                              <div className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                                {q.prompt}
                              </div>

                              <div className="grid gap-3">
                                {q.choices.map(choice => {
                                  const selected = chosen === choice.id;
                                  const correct = choice.id === q.correctChoiceId;

                                  let borderColor = 'var(--color-neutral-300)';
                                  let bgColor = 'transparent';
                                  let textColor = 'var(--color-text)';

                                  if (!isRevealed) {
                                    if (selected) {
                                      borderColor = 'var(--color-primary)';
                                      bgColor = 'var(--color-surface)';
                                    }
                                  } else {
                                    if (correct) {
                                      borderColor = '#22c55e';
                                      bgColor = '#dcfce7';
                                      textColor = '#166534';
                                    } else if (selected && !correct) {
                                      borderColor = '#ef4444';
                                      bgColor = '#fee2e2';
                                      textColor = '#7f1d1d';
                                    }
                                  }

                                  return (
                                    <button
                                      key={choice.id}
                                      type="button"
                                      disabled={isRevealed}
                                      onClick={() => setAnswer(q.id, choice.id)}
                                      className="w-full text-left p-4 rounded-xl border transition"
                                      style={{
                                        borderColor,
                                        backgroundColor: bgColor,
                                        color: textColor,
                                        cursor: isRevealed ? 'default' : 'pointer'
                                      }}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div
                                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold"
                                          style={{
                                            backgroundColor: !isRevealed
                                              ? (selected ? 'var(--color-primary)' : 'var(--color-neutral-200)')
                                              : correct
                                                ? '#22c55e'
                                                : selected && !correct
                                                  ? '#ef4444'
                                                  : 'var(--color-neutral-200)',
                                            color: !isRevealed
                                              ? (selected ? 'white' : 'var(--color-text)')
                                              : (correct || (selected && !correct) ? 'white' : 'var(--color-text)'),
                                            flexShrink: 0
                                          }}
                                        >
                                          {choice.id}
                                        </div>
                                        <div>{choice.text}</div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              {isRevealed && (
                                <div
                                  className="mt-4 p-4 rounded-xl border"
                                  style={{
                                    borderColor: answers[q.id] === q.correctChoiceId ? '#22c55e' : '#ef4444',
                                    backgroundColor: answers[q.id] === q.correctChoiceId ? '#f0fdf4' : '#fef2f2'
                                  }}
                                >
                                  <div className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                                    {answers[q.id] === q.correctChoiceId ? '✅ Correct' : '❌ Not quite'}
                                  </div>
                                  <div className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                    Correct answer: <span className="font-semibold">{q.correctChoiceId}</span>
                                  </div>
                                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                    {q.explanation}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {blockIndex < activeModule.lessonBlocks.length - 1 && (
                        <div className="border-t pt-2" style={{ borderColor: 'var(--color-neutral-200)' }} />
                      )}
                    </div>
                  ))}

                  {/* Takeaway */}
                  <section
                    className="p-5 rounded-xl"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                      Brief Takeaways
                    </h3>
                    <ul className="space-y-2 pl-5 list-disc" style={{ color: 'var(--color-text-secondary)' }}>
                      {activeModule.takeaway.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </section>
                </section>

                <div className="mt-10 flex justify-between items-center">
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Complete every module to unlock the final radar chart.
                  </div>

                  {allAnswered && (
                    <button
                      type="button"
                      onClick={() => setActiveModuleId('results')}
                      className="px-5 py-3 rounded-xl font-semibold"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'white'
                      }}
                    >
                      View Results
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                    8. Results
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Your radar chart summarizes your performance across the core financial literacy areas most relevant for new grads living independently.
                  </p>
                </div>

                <div className="grid xl:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
                  <div
                    className="p-6 rounded-xl"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <div className="flex justify-center">
                      <div
                        ref={radarShareRef}
                        className="inline-block"
                        style={{
                          backgroundColor: '#ffffff',
                          padding: '24px',
                          borderRadius: '20px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                        }}
                      >
                        <div
                          className="mb-4 text-center"
                          style={{ color: '#111827' }}
                        >
                          <div className="text-2xl font-bold">My Financial Literacy Radar</div>
                          <div className="text-sm" style={{ color: '#6b7280' }}>
                            New Grad Edition
                          </div>
                        </div>

                        <RadarChart scores={scores} />

                        <div
                          className="mt-4 text-center text-sm"
                          style={{ color: '#6b7280' }}
                        >
                          Average Score:{' '}
                          <span className="font-semibold" style={{ color: '#111827' }}>
                            {Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 justify-center">
                      <button
                        type="button"
                        onClick={handleShare}
                        className="px-4 py-2 rounded-xl font-semibold"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                      >
                        Share
                      </button>
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="px-4 py-2 rounded-xl font-semibold border"
                        style={{ borderColor: 'var(--color-neutral-300)', color: 'var(--color-text)' }}
                      >
                        Download Image
                      </button>
                      <button
                        type="button"
                        onClick={handleShareLink}
                        className="px-4 py-2 rounded-xl font-semibold border"
                        style={{ borderColor: 'var(--color-neutral-300)', color: 'var(--color-text)' }}
                      >
                        Copy Link
                      </button>
                      <button
                        type="button"
                        onClick={handleShareX}
                        className="px-4 py-2 rounded-xl font-semibold border"
                        style={{ borderColor: 'var(--color-neutral-300)', color: 'var(--color-text)' }}
                      >
                        Share to X
                      </button>
                      <button
                        type="button"
                        onClick={handleShareFacebook}
                        className="px-4 py-2 rounded-xl font-semibold border"
                        style={{ borderColor: 'var(--color-neutral-300)', color: 'var(--color-text)' }}
                      >
                        Facebook
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div
                      className="p-5 rounded-xl"
                      style={{ backgroundColor: 'var(--color-background)' }}
                    >
                      <div className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>
                        Average Score
                      </div>
                      <div className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
                        {Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6)}
                      </div>
                    </div>

                    {SKILLS.map(skill => {
                      const benchmark = benchmarkLabel(scores[skill.key]);
                      return (
                        <div
                          key={skill.key}
                          className="p-4 rounded-xl"
                          style={{ backgroundColor: 'var(--color-background)' }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
                                {skill.label}
                              </div>
                              <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                {skill.description}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                                {scores[skill.key]}
                              </div>
                              <div className="text-xs font-semibold" style={{ color: benchmark.tone }}>
                                {benchmark.label}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 w-full h-2 rounded-lg" style={{ backgroundColor: 'var(--color-neutral-200)' }}>
                            <div
                              className="h-2 rounded-lg"
                              style={{
                                width: `${scores[skill.key]}%`,
                                backgroundColor: 'var(--color-primary)'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setAnswers({});
                        setRevealed({});
                        setActiveModuleId(MODULES[0].id);
                      }}
                      className="w-full px-5 py-3 rounded-xl font-semibold border"
                      style={{
                        borderColor: 'var(--color-neutral-300)',
                        color: 'var(--color-text)'
                      }}
                    >
                      Retake Course
                    </button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {glossaryTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
            onClick={() => setGlossaryTerm(null)}
          />
          <div
            className="relative max-w-md w-full rounded-2xl shadow-2xl p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderWidth: '1px',
              borderColor: 'var(--color-neutral-200)'
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                  {glossaryTerm}
                </h3>
                <p className="mt-3 leading-7" style={{ color: 'var(--color-text-secondary)' }}>
                  {GLOSSARY[glossaryTerm] ?? 'Definition not found.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGlossaryTerm(null)}
                className="px-3 py-1 rounded-lg border"
                style={{
                  borderColor: 'var(--color-neutral-300)',
                  color: 'var(--color-text)'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}