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

// 앱 롤(DATABASE_URL)은 _prisma_migrations를 읽을 수 없어 덤프가 실패한다.
// 테이블 소유자로 붙는 DIRECT_URL을 쓴다.
const raw = process.env.DIRECT_URL;
if (!raw) {
    console.error('DIRECT_URL이 없습니다. .env에 넣고 `npm run db:backup`으로 실행하세요.');
    process.exit(1);
}

// pg_dump는 Prisma 전용 쿼리 파라미터(schema=...)를 이해하지 못한다.
// 비밀번호는 명령줄 대신 PGPASSWORD로 넘긴다. 명령줄은 ps와 에러 메시지에 그대로 보인다.
const url = new URL(raw);
const password = decodeURIComponent(url.password);
url.password = '';
const sslmode = url.searchParams.get('sslmode');
url.search = sslmode ? `sslmode=${sslmode}` : '';

const dir = path.join(homedir(), 'beenslab-blog-backups');
mkdirSync(dir, {recursive: true});

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const out = path.join(dir, `beenslab-${stamp}.sql`);

try {
    execFileSync(
        'pg_dump',
        [url.toString(), '--schema=blog', '--no-owner', '--no-privileges', '-f', out],
        {stdio: ['ignore', 'inherit', 'inherit'], env: {...process.env, PGPASSWORD: password}},
    );
} catch {
    console.error('pg_dump가 실패했습니다. 위의 pg_dump 메시지를 확인하세요.');
    process.exit(1);
}

console.log(`백업 완료: ${out}`);
console.log('복구: psql "<DIRECT_URL>" -f <파일>');
