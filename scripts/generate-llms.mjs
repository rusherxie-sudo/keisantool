import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildLlms } from '../src/lib/llms.js';

const output = resolve(process.cwd(), 'public/llms.txt');
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, buildLlms(), 'utf8');
