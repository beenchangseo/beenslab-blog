import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {test} from 'node:test';

const BLOCKED = [
    'npx prisma migrate dev --name x',
    'cd a && prisma db push',
    'echo ok; pnpm exec prisma migrate reset --force',
    '(npx prisma migrate dev)',
    'ls\nnpx prisma db push',
    'node_modules/.bin/prisma migrate dev',
    'env DATABASE_URL=x npx prisma db push',
    'FOO=1 BAR=2 prisma migrate reset',
    './node_modules/.bin/prisma db push --force-reset',
    'npx --yes prisma migrate dev',
    'npx prisma@6 db push',
    'npm exec prisma migrate dev',
    'npm exec -- prisma db push',
    'bash -c "npx prisma migrate dev"',
    "sh -lc 'prisma db push'",
    'time npx prisma migrate reset',
    'sudo prisma db push',
    'pnpm dlx prisma migrate dev',
];

const ALLOWED = [
    "cat > f <<'EOF'\n- `prisma migrate dev` is banned\nEOF",
    'git commit -m "docs: prisma migrate dev 금지"',
    'npm run migrate:deploy && npx prisma migrate status',
    'npx prisma migrate diff --from-schema-datasource prisma/schema.prisma',
    'echo "see docs about prisma migrate dev"',
    'npx prisma generate',
    'npx --yes prisma generate',
    'npm exec prisma migrate deploy',
    'gh pr comment 3 --body "guard now blocks prisma db push variants"',
];

function exitCode(command) {
    return spawnSync('node', [new URL('./guard-bash.mjs', import.meta.url).pathname], {
        input: JSON.stringify({tool_input: {command}}),
    }).status;
}

for (const command of BLOCKED) {
    test(`blocks ${JSON.stringify(command)}`, () => assert.equal(exitCode(command), 2));
}

for (const command of ALLOWED) {
    test(`allows ${JSON.stringify(command)}`, () => assert.equal(exitCode(command), 0));
}
