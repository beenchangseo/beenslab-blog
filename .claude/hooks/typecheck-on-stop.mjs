// Stop: runs the type check when TypeScript files changed, and sends Claude back to
// fix errors instead of ending the turn. On a repeated stop it only reports, so a
// failure Claude cannot fix does not loop.
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const run = (cmd, args) => spawnSync(cmd, args, {cwd: root, encoding: 'utf8'});

const changed = run('git', ['status', '--porcelain'])
    .stdout.split('\n')
    .some((line) => /\.(ts|tsx)$/.test(line.trim()));
if (!changed) process.exit(0);

const check = run('npm', ['run', '--silent', 'typecheck']);
if (check.status === 0) process.exit(0);

const lines = `${check.stdout}${check.stderr}`.trim().split('\n');
const tsErrors = lines.filter((line) => line.includes('error TS'));
const errors = (tsErrors.length > 0 ? tsErrors : lines).slice(0, 40).join('\n');
const output = input.stop_hook_active
    ? {systemMessage: `typecheck still failing:\n${errors}`}
    : {
          decision: 'block',
          reason: `npm run typecheck failed. Fix these before finishing:\n${errors}`,
      };
process.stdout.write(JSON.stringify(output));
