import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8'));
const file = input.tool_input?.file_path ?? input.tool_response?.filePath;
const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

const relative = file ? path.relative(root, file) : '';
const lintable = /\.(ts|tsx|mjs|js)$/.test(relative);
const outside = relative.startsWith('..') || /^(node_modules|\.next)\//.test(relative);
if (!file || !lintable || outside) process.exit(0);

const bin = (name) => path.join(root, 'node_modules', '.bin', name);
const run = (cmd, args) => spawnSync(cmd, args, {cwd: root, encoding: 'utf8'});

run(bin('prettier'), ['--write', '--log-level', 'warn', file]);

const lint = run(bin('eslint'), ['--max-warnings', '0', '--no-warn-ignored', file]);
if (lint.status !== 0) {
    process.stderr.write(`eslint ${relative}\n${lint.stdout}${lint.stderr}`);
    process.exit(2);
}
