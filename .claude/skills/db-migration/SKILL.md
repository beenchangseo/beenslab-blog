---
name: db-migration
description: prisma/schema.prisma를 바꾸거나, 테이블·컬럼·인덱스를 추가하거나, SQL로 운영 데이터를 고칠 때 쓴다. 로컬과 운영이 DB 하나를 공유하므로 이 순서를 벗어나면 운영 데이터가 바로 바뀐다.
---

# DB 마이그레이션

로컬 개발 서버와 운영(Vercel)이 Oracle Cloud VM의 PostgreSQL 하나를 같이 쓴다. 마이그레이션은 곧바로 운영 DB에 적용된다.

## 순서

1. `npm run db:backup`으로 `blog` 스키마 전체를 `~/beenslab-blog-backups/`에 덤프한다. 글 본문이 들어 있으므로 저장소 안에 두지 않는다.
2. `prisma/schema.prisma`를 고친다. 테이블과 컬럼은 snake_case이고 모델은 `@@map`으로 테이블 이름을 정한다.
3. `npm run migrate:new -- <소문자_밑줄_이름>`을 실행한다. DB는 건드리지 않고 `prisma/migrations/<시각>_<이름>/migration.sql`만 만든다.
4. 생성된 SQL을 읽는다. `DROP`, `ALTER ... TYPE`, 기존 행이 있는 컬럼에 `NOT NULL` 추가처럼 데이터를 잃거나 실패할 문장이 있으면 멈추고 사용자에게 확인한다. 되돌리려면 생성된 디렉터리를 지우면 된다.
5. `npm run migrate:deploy`로 적용한다.
6. `npm run migrate:status`로 적용 상태를 확인하고, `npx prisma generate`로 클라이언트를 다시 만든다.
7. `npm run check`를 돌린다.

## 하지 말 것

- `migrate dev`, `migrate reset`, `db push`. 섀도 DB를 만들거나, 드리프트를 감지하면 운영 DB 리셋을 제안한다. `.claude/hooks/guard-bash.mjs`가 막는다.
- PostgreSQL 서버 전역 설정 변경(`ALTER SYSTEM`, `pg_hba.conf`). 같은 인스턴스에 `emotion_tree` DB가 있다.

## 알아둘 것

- 앱은 DML만 가능한 `beenslab_app` 롤(`DATABASE_URL`)로 붙는다. 마이그레이션과 백업만 테이블 소유자 `postgres`(`DIRECT_URL`)로 돈다. `DIRECT_URL`은 로컬 `.env`에만 있고 Vercel에는 없다.
- 새 테이블에는 `ALTER DEFAULT PRIVILEGES` 덕분에 `beenslab_app` 권한이 자동으로 붙는다. 따로 GRANT하지 않는다.
- `0_init`은 기존 운영 DB 구조를 옮겨 적은 베이스라인이다. 실행하지 않고 `migrate resolve --applied`로 기록만 했다. 빈 DB에 `migrate deploy`할 때만 실제로 돈다.
- SQL로 데이터를 직접 바꾸면 Server Action을 거치지 않으므로 `revalidatePath`가 불리지 않는다. 공개 페이지는 ISR 캐시가 만료될 때까지(최대 1시간) 옛 내용을 보여준다. 급하면 재배포한다.
- 한글은 NFC로 저장한다. SQL로 텍스트를 넣을 때도 `normalize(..., NFC)`를 건다. NFD가 섞이면 커버 이미지(Satori)가 글자를 두부(□)로 그린다.
