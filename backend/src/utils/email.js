import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesDir = path.resolve(__dirname, '../templates/email');

async function readTemplate(fileName) {
  const templatePath = path.join(templatesDir, fileName);
  return readFile(templatePath, 'utf-8');
}

function injectVariables(template, variables) {
  return Object.entries(variables).reduce((acc, [key, value]) => {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    return acc.replace(pattern, value ?? '');
  }, template);
}

export async function renderEmailTemplate(templateName, variables) {
  const [base, partial] = await Promise.all([
    readTemplate('base.html'),
    readTemplate(`${templateName}.html`),
  ]);
  const content = injectVariables(partial, variables);
  return injectVariables(base, { ...variables, content });
}
