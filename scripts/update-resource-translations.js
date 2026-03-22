const fs = require('fs');
const path = require('path');

const root = '/Users/liyuxin/Desktop/Finotype/messages';

const esModules = [
  {
    id: 'paycheckLiteracy',
    title: 'Comprension de Nomina',
    description: 'Entender nomina, deducciones, impuestos e ingresos gravables',
    submodules: [
      { id: 'fiscal-ship', title: 'The Fiscal Ship', summary: 'Simulacion interactiva sobre el presupuesto federal de EE. UU. que obliga a equilibrar prioridades politicas con sostenibilidad de deuda a largo plazo.' },
      { id: 'uber-game', title: 'The Uber Game', summary: 'Simulacion del trabajo en la economia gig donde debes equilibrar costos, tiempo e ingresos para entender margenes reales de los conductores.' },
      { id: 'earnest-paycheck-deductions', title: 'Everything Deducted From Your Paycheck, Explained (Earnest)', summary: 'Desglose practico de impuestos obligatorios, beneficios antes de impuestos y deducciones despues de impuestos para entender tu salario neto.' },
      { id: 'benjamin-talks-paycheck', title: 'A Paycheck Overview for You and Your Child (Benjamin Talks)', summary: 'Guia basica para diferenciar salario bruto y neto, leer el recibo de pago y comprender retenciones y deducciones voluntarias.' },
    ],
  },
  {
    id: 'housingBills',
    title: 'Vivienda y Facturas',
    description: 'Gestionar alquiler, servicios, depositos y obligaciones recurrentes',
    submodules: [
      { id: 'nerdwallet-cost-of-living', title: 'Cost of Living Calculator | City and Salary Comparison Tool (NerdWallet)', summary: 'Herramienta para comparar costo de vida entre ciudades y calcular el salario necesario para mantener el mismo nivel de vida.' },
      { id: 'discover-roommate-costs', title: 'How to Split Living Costs With Your Roommate (Discover)', summary: 'Estrategias para dividir gastos con companeros de piso, establecer reglas claras y evitar conflictos financieros.' },
      { id: 'the-onion-rent-satire', title: 'The Onion: Landlord Forced To Raise Rent Due To Thinking Of Bigger Number', summary: 'Satira sobre aumentos arbitrarios de renta que refleja desequilibrios de poder entre propietarios e inquilinos.' },
      { id: 'california-security-deposit-guide', title: 'Guide to Security Deposits & Renter Rights (Self Help Courts)', summary: 'Guia legal sobre limites de deposito, deducciones permitidas, plazos de devolucion y derechos de inquilinos en California.' },
      { id: 'first-apartment-hidden-costs', title: 'Unpacking the Costs of Your First Apartment: What TikTok Didnt Tell You', summary: 'Resumen realista de costos ocultos del primer departamento: depositos, conexion de servicios, seguros, muebles y gastos mensuales.' },
    ],
  },
  {
    id: 'spendingControl',
    title: 'Control de Gastos',
    description: 'Gestionar necesidades, gasto flexible y habitos de presupuesto',
    submodules: [
      { id: 'ynab-four-rules', title: 'How to Stress Less About Money: 4 Simple Rules (YNAB)', summary: 'Marco practico de cuatro reglas para asignar cada dolar, anticipar gastos reales y reducir el estres financiero.' },
      { id: 'investopedia-503020', title: 'The 50/30/20 Rule: A Guide to Budgeting Your Money (Investopedia)', summary: 'Metodo simple para distribuir ingresos entre necesidades, deseos y metas financieras de largo plazo.' },
      { id: 'thirty-day-rule', title: 'The 30-Day Rule for Impulse Purchases (The Balance)', summary: 'Tecnica de espera de 30 dias para frenar compras impulsivas y alinear gasto con prioridades reales.' },
    ],
  },
  {
    id: 'creditDebt',
    title: 'Credito y Deuda',
    description: 'Usar tarjetas de credito con seguridad y entender costos de endeudamiento',
    submodules: [
      { id: 'evolution-of-trust', title: 'The Evolution of Trust', summary: 'Juego interactivo de teoria de juegos que muestra como cooperacion y confianza afectan resultados a largo plazo.' },
      { id: 'credit-interest-calculator', title: 'Credit Card Interest Calculator (Visualized)', summary: 'Calculadora visual para estimar tiempo de pago y costo total de intereses segun APR y pago mensual.' },
      { id: 'psychology-of-credit-card-spending', title: 'The Psychology of Credit Card Spending (Psychology Today)', summary: 'Explica como la tarjeta reduce el dolor de pagar y puede aumentar el gasto por distancia psicologica.' },
      { id: 'credit-card-representative-confessions', title: "Confessions of a Credit Card Representative (Reader's Digest)", summary: 'Casos donde usar tarjeta puede ser riesgoso o caro, y por que no debe reemplazar un fondo de emergencia.' },
      { id: 'credit-scores-explained', title: 'Credit Scores Explained with Pizza (Visual Capitalist)', summary: 'Historia visual de la evolucion del credito de confianza local a puntajes algoritmicos modernos.' },
    ],
  },
  {
    id: 'safetyNet',
    title: 'Red de Seguridad',
    description: 'Seguros, fondos de emergencia y resiliencia financiera a largo plazo',
    submodules: [
      { id: 'financial-football', title: 'Financial Football', summary: 'Juego educativo tematico de NFL que ensena presupuesto, credito, deuda y ahorro de emergencia.' },
      { id: 'f-you-money', title: 'The F-You Money Concept (JL Collins)', summary: 'Ensayo sobre como reservas de efectivo amplias aumentan libertad personal y poder de negociacion.' },
      { id: 'build-emergency-fund', title: 'How to Build an Emergency Fund (The Balance)', summary: 'Guia sobre por que un fondo de emergencia evita deuda costosa ante desempleo o gastos inesperados.' },
      { id: 'financial-resilience-crisis', title: 'Financial Resilience: How to Survive a Crisis (MoneySense)', summary: 'Estrategia integral para resistir crisis con ahorro liquido, menor deuda y presupuesto adaptable.' },
    ],
  },
  {
    id: 'fraudSafety',
    title: 'Fraude y Seguridad',
    description: 'Proteger identidad, cuentas y perfil de credito',
    submodules: [
      { id: 'google-phishing-quiz', title: "Google's Phishing Quiz", summary: 'Entrenamiento interactivo para identificar phishing mediante senales en remitente, enlaces y urgencia falsa.' },
      { id: 'psychology-of-scam', title: 'The Psychology of the Scam (Wired)', summary: 'Investigacion sobre tacticas psicologicas de estafas romanticas y como explotan confianza y soledad.' },
      { id: 'scammed-out-of-50000', title: 'I Was Scammed Out of $50,000 (The Cut)', summary: 'Caso real que muestra como estafadores usan miedo y autoridad para manipular incluso a personas informadas.' },
      { id: 'credit-freeze-guide', title: 'How to Freeze Your Credit: A 3-Minute Guide (Brian Krebs)', summary: 'Guia breve para congelar historial crediticio y bloquear apertura fraudulenta de nuevas lineas de credito.' },
      { id: 'identity-theft-horror-story', title: 'Identity Theft: A Modern Horror Story (Experian Blog)', summary: 'Narrativa de robo de identidad que muestra impactos financieros y emocionales de fraudes sofisticados.' },
      { id: 'password-debate', title: "The Great Password Debate: Is Your Dogs Name Enough? (Norton)", summary: 'Buenas practicas de contrasenas fuertes y unicas para reducir riesgos de fuerza bruta y credential stuffing.' },
      { id: 'social-engineering-vishing', title: 'Social Engineering: The Art of Human Hacking (Security Through Education)', summary: 'Explica el vishing y por que la verificacion activa es la defensa principal contra suplantacion por voz.' },
    ],
  },
];

const zhModules = [
  {
    id: 'paycheckLiteracy',
    title: '工资单理解',
    description: '理解工资、扣款、税务与应税收入',
    submodules: [
      { id: 'fiscal-ship', title: 'The Fiscal Ship', summary: '关于美国联邦预算的互动模拟，要求在政策优先级与长期债务可持续性之间做取舍。' },
      { id: 'uber-game', title: 'The Uber Game', summary: '网约车工作情境模拟，展示油费、维护费、评分与收入目标之间的现实压力。' },
      { id: 'earnest-paycheck-deductions', title: 'Everything Deducted From Your Paycheck, Explained (Earnest)', summary: '清晰拆解工资扣项：法定税费、税前福利与税后扣款，帮助理解到手工资构成。' },
      { id: 'benjamin-talks-paycheck', title: 'A Paycheck Overview for You and Your Child (Benjamin Talks)', summary: '面向新手的工资单指南，解释税前税后工资、代扣税与常见自愿扣款。' },
    ],
  },
  {
    id: 'housingBills',
    title: '住房与账单',
    description: '管理房租、水电押金与持续性支出',
    submodules: [
      { id: 'nerdwallet-cost-of-living', title: 'Cost of Living Calculator | City and Salary Comparison Tool (NerdWallet)', summary: '比较不同城市生活成本，并估算迁居后维持同等生活水平所需薪资。' },
      { id: 'discover-roommate-costs', title: 'How to Split Living Costs With Your Roommate (Discover)', summary: '提供与室友分摊费用的实用方法，强调提前沟通与规则透明。' },
      { id: 'the-onion-rent-satire', title: 'The Onion: Landlord Forced To Raise Rent Due To Thinking Of Bigger Number', summary: '用讽刺手法批评随意涨租与租客在议价中的弱势地位。' },
      { id: 'california-security-deposit-guide', title: 'Guide to Security Deposits & Renter Rights (Self Help Courts)', summary: '官方法律指南：押金上限、可扣项、返还时限与纠纷处理流程。' },
      { id: 'first-apartment-hidden-costs', title: 'Unpacking the Costs of Your First Apartment: What TikTok Didnt Tell You', summary: '揭示首次租房的隐藏成本：押金、开通费、保险、家具与每月杂费。' },
    ],
  },
  {
    id: 'spendingControl',
    title: '支出控制',
    description: '管理必要支出、弹性消费与预算习惯',
    submodules: [
      { id: 'ynab-four-rules', title: 'How to Stress Less About Money: 4 Simple Rules (YNAB)', summary: '四条预算规则帮助你给每一笔钱分配任务，减少金钱焦虑并建立缓冲。' },
      { id: 'investopedia-503020', title: 'The 50/30/20 Rule: A Guide to Budgeting Your Money (Investopedia)', summary: '用50/30/20进行预算分配：需求、想要与长期财务目标。' },
      { id: 'thirty-day-rule', title: 'The 30-Day Rule for Impulse Purchases (The Balance)', summary: '通过30天冷静期抑制冲动消费，让开支更符合长期价值。' },
    ],
  },
  {
    id: 'creditDebt',
    title: '信用与债务',
    description: '安全使用信用卡并理解借贷成本',
    submodules: [
      { id: 'evolution-of-trust', title: 'The Evolution of Trust', summary: '基于博弈论的互动作品，展示合作与背叛如何影响长期信任结果。' },
      { id: 'credit-interest-calculator', title: 'Credit Card Interest Calculator (Visualized)', summary: '可视化信用卡利息工具，展示不同月供下还清时间与总利息成本。' },
      { id: 'psychology-of-credit-card-spending', title: 'The Psychology of Credit Card Spending (Psychology Today)', summary: '解释支付痛感如何影响消费决策，为什么刷卡更容易超支。' },
      { id: 'credit-card-representative-confessions', title: "Confessions of a Credit Card Representative (Readers Digest)", summary: '总结不应刷卡的高风险场景，强调信用卡不应替代应急资金。' },
      { id: 'credit-scores-explained', title: 'Credit Scores Explained with Pizza (Visual Capitalist)', summary: '用可视化时间线解释消费信贷与信用评分体系的历史演变。' },
    ],
  },
  {
    id: 'safetyNet',
    title: '财务安全网',
    description: '保险、应急金与长期财务韧性',
    submodules: [
      { id: 'financial-football', title: 'Financial Football', summary: 'NFL主题财商游戏，用答题方式学习预算、债务、信用与应急金。' },
      { id: 'f-you-money', title: 'The F-You Money Concept (JL Collins)', summary: '强调充足现金储备带来的选择自由与议价能力。' },
      { id: 'build-emergency-fund', title: 'How to Build an Emergency Fund (The Balance)', summary: '说明应急金如何应对失业、医疗与突发维修，避免高息债务。' },
      { id: 'financial-resilience-crisis', title: 'Financial Resilience: How to Survive a Crisis (MoneySense)', summary: '从储蓄、降债、灵活预算与保险四方面建立抗风险能力。' },
    ],
  },
  {
    id: 'fraudSafety',
    title: '反诈骗与安全',
    description: '保护身份信息、账户与信用档案',
    submodules: [
      { id: 'google-phishing-quiz', title: 'Googles Phishing Quiz', summary: '互动测验训练识别钓鱼邮件与社工攻击中的关键风险信号。' },
      { id: 'psychology-of-scam', title: 'The Psychology of the Scam (Wired)', summary: '深度揭示情感诈骗的心理操控流程及其造成的财务与情绪伤害。' },
      { id: 'scammed-out-of-50000', title: 'I Was Scammed Out of $50,000 (The Cut)', summary: '真实案例：诈骗者如何利用恐惧与权威让受害者迅速失去判断。' },
      { id: 'credit-freeze-guide', title: 'How to Freeze Your Credit: A 3-Minute Guide (Brian Krebs)', summary: '介绍如何免费冻结信用报告，降低身份盗用后开新户风险。' },
      { id: 'identity-theft-horror-story', title: 'Identity Theft: A Modern Horror Story (Experian Blog)', summary: '身份盗窃案例叙事，强调现代诈骗对财务与心理的双重破坏。' },
      { id: 'password-debate', title: 'The Great Password Debate: Is Your Dogs Name Enough? (Norton)', summary: '讲解高强度唯一密码策略，防止撞库与暴力破解连锁风险。' },
      { id: 'social-engineering-vishing', title: 'Social Engineering: The Art of Human Hacking (Security Through Education)', summary: '解析语音钓鱼攻击手法，强调核验流程是核心防线。' },
    ],
  },
];

for (const [file, modules] of [
  ['es.json', esModules],
  ['zh.json', zhModules],
]) {
  const fullPath = path.join(root, file);
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  data.resources = data.resources || {};
  data.resources.modules = modules;
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

console.log('Translated resources.modules in es.json and zh.json');
