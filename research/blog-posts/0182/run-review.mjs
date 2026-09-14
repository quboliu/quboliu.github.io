import fs from 'node:fs';
import { spawn } from 'node:child_process';

const [promptFile, outputFile, sessionId] = process.argv.slice(2);
if (!promptFile || !outputFile) throw new Error('usage: node run-review.mjs prompt.md output.txt');
const prompt = fs.readFileSync(promptFile, 'utf8');
const out = fs.createWriteStream(outputFile, { flags: 'wx' });
const args = [...(sessionId ? ['--session', sessionId] : []), '-p', prompt, '--output-format', 'text'];
const child = spawn('/home/xuntingmu/.kimi-code/bin/kimi', args, {
  cwd: '/home/xuntingmu/workspace/quboliu.github.io',
  stdio: ['ignore', 'pipe', 'pipe'],
});
for (const stream of [child.stdout, child.stderr]) {
  stream.on('data', chunk => { out.write(chunk); process.stdout.write(chunk); });
}
child.on('error', error => { out.end(String(error)); process.exitCode = 1; });
child.on('close', code => { out.end(); process.exitCode = code ?? 1; });
