const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const vm = require('vm');

const root = process.cwd();
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

const skills = exported.SKILLS;
const glossary = exported.GLOSSARY;
const modules = exported.MODULES;

if (!Array.isArray(skills) || !glossary || !Array.isArray(modules)) {
  throw new Error('Failed to load SKILLS/GLOSSARY/MODULES from lib/technical/data.ts');
}

for (const locale of ['en']) {
  const msgPath = path.join(root, 'messages', `${locale}.json`);
  const json = JSON.parse(fs.readFileSync(msgPath, 'utf8'));

  if (!json.technicalQuestion) json.technicalQuestion = {};
  if (!json.technicalQuestion.ui) json.technicalQuestion.ui = {};

  json.technicalQuestion.skills = skills;
  json.technicalQuestion.glossary = glossary;
  json.technicalQuestion.modules = modules;

  fs.writeFileSync(msgPath, JSON.stringify(json, null, 2) + '\n');
}

console.log('Synced technicalQuestion content for en only:', {
  modules: modules.length,
  skills: skills.length,
  glossary: Object.keys(glossary).length,
});
