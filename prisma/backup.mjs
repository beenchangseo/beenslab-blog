import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {homedir} from 'node:os';
import path from 'node:path';

const ownerUrl = process.env.DIRECT_URL;
if (!ownerUrl) {
    console.error('DIRECT_URL이 없습니다. .env에 넣고 `npm run db:backup`으로 실행하세요.');
    process.exit(1);
}

// pg_dump rejects Prisma's own query parameters such as schema=. The password goes
// through PGPASSWORD because the command line shows up in ps and in error messages.
const url = new URL(ownerUrl);
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
