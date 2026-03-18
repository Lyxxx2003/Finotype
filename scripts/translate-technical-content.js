const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const vm = require('vm');

const root = process.cwd();

function loadTechnicalData() {
  const dataPath = path.join(root, 'lib/technical/data.ts');
  const dataSource = fs.readFileSync(dataPath, 'utf8');
  const transpiled = ts.transpileModule(dataSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;

  const moduleRef = { exports: {} };
  const sandbox = { exports: moduleRef.exports, module: moduleRef, require, console };
  vm.runInNewContext(transpiled, sandbox, { filename: 'technical-data.js' });
  const exported = moduleRef.exports;

  if (!Array.isArray(exported.MODULES) || !Array.isArray(exported.SKILLS) || !exported.GLOSSARY) {
    throw new Error('Unable to load MODULES/SKILLS/GLOSSARY from lib/technical/data.ts');
  }

  return {
    modules: exported.MODULES,
    skills: exported.SKILLS,
    glossary: exported.GLOSSARY,
  };
}

const NON_TRANSLATABLE_TERMS = [
  'Gross Pay',
  'Net Pay',
  'Taxable Income',
  'Withholding',
  'W-4',
  'FICA',
  'Pre-tax Deduction',
  'Pay Stub',
  'Fixed Expense',
  'Variable Expense',
  'Security Deposit',
  'Checking Account',
  'Savings Account',
  'Debit Card',
  'Credit Card',
  'APR',
  'Credit Utilization',
  'Statement Balance',
  'Minimum Payment',
  'Annual Fee',
  'Foreign Transaction Fee',
  'Premium',
  'Deductible',
  'Copay',
  'Coinsurance',
  'Out-of-Pocket Maximum',
  'In-Network',
  '401(k)',
  'Employer Match',
  'Renter Insurance',
  'Auto Insurance',
  'Emergency Fund',
  'Liquidity',
  'Phishing',
  'Identity Theft',
  'Credit Freeze',
  'Experian',
  'Equifax',
  'TransUnion',
  'HSA',
  'Certificate of Deposit',
  'RSU',
  'Fund',
  'Diversification',
  'APY',
  'Direct Deposit',
  'Overdraft',
  'Due Date',
  'RSU Vesting',
  'Paycheck Literacy',
  'Housing & Bills',
  'Spending Control',
  'Credit & Debt',
  'Safety Net',
  'Fraud & Safety',
];

const cache = new Map();

async function translateRaw(text, target) {
  if (!text || !text.trim()) return text;
  const cacheKey = `${target}::${text}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&dt=t&tl=' +
    encodeURIComponent(target) +
    '&q=' +
    encodeURIComponent(text);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Translate API failed: ${res.status}`);

  const data = await res.json();
  const translated = (data?.[0] || []).map((chunk) => chunk[0]).join('');
  cache.set(cacheKey, translated || text);

  // Mild rate limiting to reduce API throttling
  await new Promise((r) => setTimeout(r, 35));
  return translated || text;
}

function protectText(text) {
  let out = text;
  const placeholders = [];

  // Protect [[...]] tokens used by tooltip rendering.
  out = out.replace(/\[\[[^\]]+\]\]/g, (m) => {
    const token = `__TK_${placeholders.length}__`;
    placeholders.push({ token, value: m });
    return token;
  });

  // Protect non-translatable technical terms.
  const uniqueTerms = [...new Set(NON_TRANSLATABLE_TERMS)].sort((a, b) => b.length - a.length);
  for (const term of uniqueTerms) {
    if (!term) continue;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'g');
    out = out.replace(re, (m) => {
      const token = `__TK_${placeholders.length}__`;
      placeholders.push({ token, value: m });
      return token;
    });
  }

  return { text: out, placeholders };
}

function unprotectText(text, placeholders) {
  let out = text;
  for (const { token, value } of placeholders) {
    out = out.split(token).join(value);
  }
  return out;
}

async function translateTextKeepingTerms(text, target) {
  const { text: protectedText, placeholders } = protectText(text);
  const translated = await translateRaw(protectedText, target);
  return unprotectText(translated, placeholders);
}

async function translateSkills(skills, target) {
  const out = [];
  for (const skill of skills) {
    out.push({
      ...skill,
      // Keep label as canonical term for consistency.
      label: skill.label,
      description: await translateTextKeepingTerms(skill.description, target),
    });
  }
  return out;
}

async function translateGlossary(glossary, target) {
  const out = {};
  for (const [key, value] of Object.entries(glossary)) {
    out[key] = await translateTextKeepingTerms(value, target);
  }
  return out;
}

async function translateModules(modules, target) {
  const translated = [];
  for (const module of modules) {
    const translatedBlocks = [];
    for (const block of module.lessonBlocks) {
      const paragraphs = [];
      for (const p of block.paragraphs) {
        paragraphs.push(await translateTextKeepingTerms(p, target));
      }

      const bullets = [];
      for (const b of block.bullets || []) {
        bullets.push(await translateTextKeepingTerms(b, target));
      }

      const questions = [];
      for (const q of block.questions) {
        const choices = [];
        for (const c of q.choices) {
          choices.push({
            ...c,
            text: await translateTextKeepingTerms(c.text, target),
          });
        }

        questions.push({
          ...q,
          title: await translateTextKeepingTerms(q.title, target),
          context: q.context ? await translateTextKeepingTerms(q.context, target) : q.context,
          prompt: await translateTextKeepingTerms(q.prompt, target),
          explanation: await translateTextKeepingTerms(q.explanation, target),
          choices,
        });
      }

      translatedBlocks.push({
        ...block,
        heading: await translateTextKeepingTerms(block.heading, target),
        paragraphs,
        bullets,
        questions,
      });
    }

    const takeaway = [];
    for (const item of module.takeaway) {
      takeaway.push(await translateTextKeepingTerms(item, target));
    }

    translated.push({
      ...module,
      title: await translateTextKeepingTerms(module.title, target),
      shortDescription: await translateTextKeepingTerms(module.shortDescription, target),
      lessonBlocks: translatedBlocks,
      takeaway,
    });
  }
  return translated;
}

async function processLocale(locale, target, source) {
  const msgPath = path.join(root, 'messages', `${locale}.json`);
  const json = JSON.parse(fs.readFileSync(msgPath, 'utf8'));
  if (!json.technicalQuestion) json.technicalQuestion = {};

  json.technicalQuestion.skills = await translateSkills(source.skills, target);
  json.technicalQuestion.glossary = await translateGlossary(source.glossary, target);
  json.technicalQuestion.modules = await translateModules(source.modules, target);

  fs.writeFileSync(msgPath, JSON.stringify(json, null, 2) + '\n');
}

async function main() {
  const source = loadTechnicalData();

  // Keep English canonical content synced from source.
  {
    const msgPath = path.join(root, 'messages', 'en.json');
    const en = JSON.parse(fs.readFileSync(msgPath, 'utf8'));
    if (!en.technicalQuestion) en.technicalQuestion = {};
    en.technicalQuestion.skills = source.skills;
    en.technicalQuestion.glossary = source.glossary;
    en.technicalQuestion.modules = source.modules;
    fs.writeFileSync(msgPath, JSON.stringify(en, null, 2) + '\n');
  }

  await processLocale('es', 'es', source);
  await processLocale('zh', 'zh-CN', source);

  console.log('Translated technicalQuestion content for es/zh with term protection.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
