// blog 스키마를 데이터까지 통째로 덤프한다. 스키마를 바꾸기 전에 돌릴 것.
//
//   npm run db:backup
//
// 덤프는 저장소 밖(~/beenslab-blog-backups)에 남긴다. 실제 게시글 데이터가
// 들어있으므로 git에 들어가면 안 된다.
//
// pg_dump가 필요하다(macOS: brew install libpq 또는 postgresql).

import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {homedir} from 'node:os';
import path from 'node:path';

const raw = process.env.DATABASE_URL;
if (!raw) {
    console.error('DATABASE_URL이 없습니다. `node --env-file=.env` 로 실행하세요.');
    process.exit(1);
}

// pg_dump는 Prisma 전용 쿼리 파라미터(schema=...)를 이해하지 못한다.
const url = new URL(raw);
const sslmode = url.searchParams.get('sslmode');
url.search = sslmode ? `sslmode=${sslmode}` : '';

const dir = path.join(homedir(), 'beenslab-blog-backups');
mkdirSync(dir, {recursive: true});

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const out = path.join(dir, `beenslab-${stamp}.sql`);

execFileSync(
    'pg_dump',
    [url.toString(), '--schema=blog', '--no-owner', '--no-privileges', '-f', out],
    {stdio: ['ignore', 'inherit', 'inherit']},
);

console.log(`백업 완료: ${out}`);
console.log('복구: psql "<DATABASE_URL>" -f <파일>');
