const fs = require('fs');
const path = require('path');

const root = '/Users/liyuxin/Desktop/Finotype/messages';

const esModuleTitles = {
  paycheckLiteracy: 'Comprension de Nomina',
  housingBills: 'Vivienda y Facturas',
  spendingControl: 'Control de Gastos',
  creditDebt: 'Credito y Deuda',
  safetyNet: 'Red de Seguridad',
  fraudSafety: 'Fraude y Seguridad',
};

const zhModuleTitles = {
  paycheckLiteracy: '工资单理解',
  housingBills: '住房与账单',
  spendingControl: '支出控制',
  creditDebt: '信用与债务',
  safetyNet: '财务安全网',
  fraudSafety: '反诈骗与安全',
};

const esSubTitles = {
  'fiscal-ship': 'La Nave Fiscal (The Fiscal Ship)',
  'uber-game': 'El Juego de Uber (The Uber Game)',
  'earnest-paycheck-deductions': 'Todo lo que se descuenta de tu nomina, explicado (Earnest)',
  'benjamin-talks-paycheck': 'Guia de nomina para ti y tu hijo (Benjamin Talks)',
  'nerdwallet-cost-of-living': 'Calculadora de costo de vida | Comparador de ciudad y salario (NerdWallet)',
  'discover-roommate-costs': 'Como dividir gastos de vivienda con tu companero de piso (Discover)',
  'the-onion-rent-satire': 'The Onion: Casero obligado a subir la renta por pensar en un numero mas grande',
  'california-security-deposit-guide': 'Guia de deposito de seguridad y derechos del inquilino (Self Help Courts)',
  'first-apartment-hidden-costs': 'Costos reales de tu primer departamento: lo que TikTok no te conto',
  'ynab-four-rules': 'Como estresarte menos por dinero: 4 reglas simples (YNAB)',
  'investopedia-503020': 'Regla 50/30/20: guia para presupuestar tu dinero (Investopedia)',
  'thirty-day-rule': 'Regla de 30 dias para compras impulsivas (The Balance)',
  'evolution-of-trust': 'La evolucion de la confianza (The Evolution of Trust)',
  'credit-interest-calculator': 'Calculadora de interes de tarjeta de credito (visual)',
  'psychology-of-credit-card-spending': 'La psicologia del gasto con tarjeta de credito (Psychology Today)',
  'credit-card-representative-confessions': 'Confesiones de un representante de tarjeta de credito (Readers Digest)',
  'credit-scores-explained': 'Puntajes de credito explicados con pizza (Visual Capitalist)',
  'financial-football': 'Futbol Financiero (Financial Football)',
  'f-you-money': 'Concepto de F-You Money (JL Collins)',
  'build-emergency-fund': 'Como crear un fondo de emergencia (The Balance)',
  'financial-resilience-crisis': 'Resiliencia financiera: como sobrevivir una crisis (MoneySense)',
  'google-phishing-quiz': 'Cuestionario de phishing de Google',
  'psychology-of-scam': 'La psicologia de la estafa (Wired)',
  'scammed-out-of-50000': 'Me estafaron 50,000 dolares (The Cut)',
  'credit-freeze-guide': 'Como congelar tu credito: guia de 3 minutos (Brian Krebs)',
  'identity-theft-horror-story': 'Robo de identidad: una historia de terror moderna (Experian Blog)',
  'password-debate': 'Gran debate de contrasenas: basta el nombre de tu perro? (Norton)',
  'social-engineering-vishing': 'Ingenieria social: arte del hackeo humano (vishing)',
};

const zhSubTitles = {
  'fiscal-ship': '财政之船（The Fiscal Ship）',
  'uber-game': '优步生存游戏（The Uber Game）',
  'earnest-paycheck-deductions': '工资单都扣了什么？一文讲清（Earnest）',
  'benjamin-talks-paycheck': '给你和孩子的工资单入门（Benjamin Talks）',
  'nerdwallet-cost-of-living': '生活成本计算器 | 城市与薪资对比工具（NerdWallet）',
  'discover-roommate-costs': '如何与室友分摊生活费用（Discover）',
  'the-onion-rent-satire': '洋葱新闻：房东因想到更大的数字被迫涨租',
  'california-security-deposit-guide': '押金与租客权益指南（Self Help Courts）',
  'first-apartment-hidden-costs': '第一次租房的真实成本：TikTok没告诉你的事',
  'ynab-four-rules': '如何减少金钱焦虑：4条简单规则（YNAB）',
  'investopedia-503020': '50/30/20 预算规则指南（Investopedia）',
  'thirty-day-rule': '冲动消费的30天规则（The Balance）',
  'evolution-of-trust': '信任的进化（The Evolution of Trust）',
  'credit-interest-calculator': '信用卡利息计算器（可视化）',
  'psychology-of-credit-card-spending': '信用卡消费心理学（Psychology Today）',
  'credit-card-representative-confessions': '信用卡客服的内幕建议（Readers Digest）',
  'credit-scores-explained': '用披萨讲清信用评分（Visual Capitalist）',
  'financial-football': '金融橄榄球（Financial Football）',
  'f-you-money': '“F-You Money” 概念（JL Collins）',
  'build-emergency-fund': '如何建立应急基金（The Balance）',
  'financial-resilience-crisis': '财务韧性：如何熬过危机（MoneySense）',
  'google-phishing-quiz': 'Google 钓鱼邮件测验',
  'psychology-of-scam': '骗局心理学（Wired）',
  'scammed-out-of-50000': '我被骗走了 5 万美元（The Cut）',
  'credit-freeze-guide': '3分钟学会冻结信用（Brian Krebs）',
  'identity-theft-horror-story': '身份盗窃：现代恐怖故事（Experian Blog）',
  'password-debate': '密码大辩论：用宠物名真的够吗？（Norton）',
  'social-engineering-vishing': '社会工程学：人类黑客艺术（语音钓鱼）',
};

function applyLocale(file, moduleTitles, subTitles) {
  const filePath = path.join(root, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const modules = data?.resources?.modules;

  if (!Array.isArray(modules)) {
    throw new Error(`${file} resources.modules is not an array`);
  }

  for (const module of modules) {
    if (moduleTitles[module.id]) {
      module.title = moduleTitles[module.id];
    }
    if (!Array.isArray(module.submodules)) continue;
    for (const sub of module.submodules) {
      if (subTitles[sub.id]) {
        sub.title = subTitles[sub.id];
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

applyLocale('es.json', esModuleTitles, esSubTitles);
applyLocale('zh.json', zhModuleTitles, zhSubTitles);

console.log('Updated translated module/submodule titles for es and zh.');
