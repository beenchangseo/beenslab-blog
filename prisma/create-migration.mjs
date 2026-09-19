// schema.prisma를 고친 뒤 마이그레이션 파일을 만든다. DB는 건드리지 않는다.
//
//   npm run migrate:new -- add_cover_image
//   (생성된 SQL을 눈으로 확인한 뒤)
//   npm run migrate:deploy
//
// 이 프로젝트는 로컬과 프로덕션이 DB 하나를 공유하므로 `prisma migrate dev`를
// 쓰지 않는다. migrate dev는 섀도 DB를 만들고, 드리프트를 감지하면 운영
// 데이터가 들어있는 DB를 리셋하라고 제안한다.

import {execFileSync} from 'node:child_process';
import {mkdirSync, writeFileSync, existsSync} from 'node:fs';
import path from 'node:path';

const EMPTY_MARKER = '-- This is an empty migration.';

const name = process.argv[2];
if (!name || !/^[a-z0-9_]+$/.test(name)) {
    console.error('사용법: npm run migrate:new -- <이름>   (소문자/숫자/밑줄만)');
    process.exit(1);
}

// 실제 DB(--from)와 schema.prisma(--to)의 차이를 SQL로 뽑는다.
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

const stamp = new Date()
    .toISOString()
    .replace(/[-:T]/g, '')
    .slice(0, 14); // YYYYMMDDHHMMSS
const dir = path.join('prisma', 'migrations', `${stamp}_${name}`);

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
