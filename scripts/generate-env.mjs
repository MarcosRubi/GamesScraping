// Genera src/environments/environment.ts a partir de .env.<modo> (y de las
// variables del proceso, que tienen prioridad: así Docker las pasa como
// build args). El archivo generado no se versiona.
//
//   node scripts/generate-env.mjs development
//   node scripts/generate-env.mjs qa

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const mode = process.argv[2] ?? 'development';
const root = resolve(import.meta.dirname, '..');

// Variables que la app conoce: [nombre, obligatoria]
const KEYS = [
  ['API_URL', true],
  ['ANALYTICS_SCRIPT_URL', false],
  ['ANALYTICS_WEBSITE_ID', false],
];

function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const i = line.indexOf('=');
        return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^(['"])(.*)\1$/, '$2')];
      }),
  );
}

const fromFile = parseEnvFile(resolve(root, `.env.${mode}`));
const values = {};
for (const [key, required] of KEYS) {
  const value = process.env[key] ?? fromFile[key] ?? '';
  if (required && !value) {
    console.error(`✖ Falta ${key}: definila en .env.${mode} (ver .env.example) o como variable de entorno.`);
    process.exit(1);
  }
  values[key] = value;
}

const out = resolve(root, 'src/environments/environment.ts');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(
  out,
  `// Generado por scripts/generate-env.mjs (${mode}). No editar ni versionar.
export const environment = {
  mode: ${JSON.stringify(mode)},
  apiUrl: ${JSON.stringify(values.API_URL.replace(/\/$/, ''))},
  analytics: {
    scriptUrl: ${JSON.stringify(values.ANALYTICS_SCRIPT_URL)},
    websiteId: ${JSON.stringify(values.ANALYTICS_WEBSITE_ID)},
  },
} as const;
`,
);
console.log(`✔ environment.ts generado para "${mode}"`);
