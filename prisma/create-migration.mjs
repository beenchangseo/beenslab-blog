import {execFileSync} from 'node:child_process';
import {mkdirSync, writeFileSync, existsSync} from 'node:fs';
import path from 'node:path';

const EMPTY_MARKER = '-- This is an empty migration.';

const name = process.argv[2];
if (!name || !/^[a-z0-9_]+$/.test(name)) {
    console.error('사용법: npm run migrate:new -- <이름>   (소문자/숫자/밑줄만)');
    process.exit(1);
}

const sql = execFileSync(
    'npx',
    [
        'prisma',
        'migrate',
        'diff',
        '--from-schema-datasource',
        'prisma/schema.prisma',
        '--to-schema-datamodel',
        'prisma/schema.prisma',
        '--script',
    ],
    {encoding: 'utf8'},
);

if (sql.trim() === EMPTY_MARKER || sql.trim() === '') {
    console.log('변경사항이 없습니다. schema.prisma가 이미 DB와 일치합니다.');
    process.exit(0);
}

const yyyymmddhhmmss = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const dir = path.join('prisma', 'migrations', `${yyyymmddhhmmss}_${name}`);

if (existsSync(dir)) {
    console.error(`이미 존재합니다: ${dir}`);
    process.exit(1);
}

mkdirSync(dir, {recursive: true});
writeFileSync(path.join(dir, 'migration.sql'), sql);

console.log(`생성됨: ${dir}/migration.sql\n`);
console.log(sql);
console.log('---');
console.log('SQL을 확인한 뒤 적용: npm run migrate:deploy');
console.log('되돌리려면 위 디렉터리를 지우면 된다(아직 DB에 적용되지 않았다).');
