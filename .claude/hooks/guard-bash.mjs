import {readFileSync} from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf8'));
const command = input.tool_input?.command ?? '';

// Matches only where a command starts, so text that merely mentions these commands
// (a heredoc writing docs, a commit message) still runs. A `sh -c "..."` argument
// counts as a command start.
const START = String.raw`(?:^|[;&|(\n]|\b(?:ba|z)?sh\s+-\w*c\s+["'])\s*`;
const PREFIXES = String.raw`(?:(?:time|sudo|exec|command|nohup)\s+|timeout\s+\S+\s+)*(?:env\s+)?(?:\w+=\S*\s+)*`;
const RUNNER = String.raw`(?:npx(?:\s+(?:-p|--package)\s+[^-\s]\S*|\s+-\S+)*\s+|npm\s+(?:exec|x)(?:\s+-\S+)*\s+(?:--\s+)?|pnpm\s+(?:exec\s+|dlx\s+)?|yarn\s+(?:dlx\s+)?|bunx\s+)?`;
const AT_COMMAND = START + PREFIXES + RUNNER + String.raw`(?:\S*/)?prisma(?:@\S+)?\s+`;

const BLOCKED = [
    {
        pattern: new RegExp(AT_COMMAND + String.raw`migrate\s+(?:dev|reset)\b`),
        reason: 'prisma migrate dev/reset은 운영 DB에 바로 적용되고 드리프트를 감지하면 리셋을 제안한다.',
    },
    {
        pattern: new RegExp(AT_COMMAND + String.raw`db\s+push\b`),
        reason: 'prisma db push는 마이그레이션 기록 없이 운영 DB 스키마를 바꾼다.',
    },
];

const hit = BLOCKED.find(({pattern}) => pattern.test(command));
if (hit) {
    process.stderr.write(
        `${hit.reason}\n로컬과 운영이 DB 하나를 공유한다. db-migration 스킬의 순서를 따를 것: ` +
            'npm run db:backup → npm run migrate:new -- <이름> → SQL 검토 → npm run migrate:deploy.\n',
    );
    process.exit(2);
}
