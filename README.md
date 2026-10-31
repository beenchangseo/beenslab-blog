# beenslab-blog

서창빈의 기술 블로그와 이력서 사이트다. https://blog.beenslab.com

- Next.js 16 App Router, React 19, TypeScript
- Prisma 6와 PostgreSQL 16 (Oracle Cloud VM)
- Tailwind CSS 4
- Upstash Redis (조회수)
- Vercel 배포 (서울 리전 `icn1`)

글은 DB에 저장하고 `/admin`의 마크다운 에디터로 쓴다. 공개 페이지는 빌드 때 만들어지고 1시간마다 다시 생성된다(ISR).

## 로컬에서 실행하기

1. 의존성을 설치한다. `postinstall`이 Prisma 클라이언트를 만든다.
   ```bash
   npm install
   ```
2. `.env-example`을 `.env`로 복사하고 값을 채운다. 각 변수의 용도는 `.env-example`의 주석에 있다.
3. 개발 서버를 띄운다. http://localhost:7777 에서 열린다.
   ```bash
   npm run dev
   ```

로컬 개발 서버도 운영과 같은 DB를 쓴다. 관리자 화면에서 저장한 글은 바로 운영에 반영된다.

## 스크립트

| 명령 | 하는 일 |
| --- | --- |
| `npm run dev` | 개발 서버 (포트 7777) |
| `npm run build` | 프로덕션 빌드. `DATABASE_URL`이 필요하다 |
| `npm run check` | 타입 검사, lint, 포맷 검사, guard hook 테스트 |
| `npm run format` | prettier로 ts, tsx, mjs 포맷 |
| `npm run test:e2e` | Playwright e2e. 처음 한 번 `npx playwright install chromium` |
| `npm run snapshot -- <url> <dir>` | 실행 중인 빌드의 응답을 기록한다. 리팩터링 전후 비교용 |
| `npm run db:backup` | `blog` 스키마를 `~/beenslab-blog-backups/`에 덤프 |
| `npm run migrate:new -- <이름>` | `schema.prisma` 변경분을 마이그레이션 SQL로 만든다. DB는 건드리지 않는다 |
| `npm run migrate:deploy` | 마이그레이션 적용 |
| `npm run migrate:status` | 적용 상태 확인 |

스키마를 바꿀 때는 `prisma migrate dev`를 쓰지 않는다. 백업, `migrate:new`, SQL 검토, `migrate:deploy` 순서로 진행한다. 자세한 순서는 `.claude/skills/db-migration/SKILL.md`에 있다.

## 구조

```
src/app/          라우트, Server Action(actions/), API 라우트
src/components/   UI. admin/, blog/, career/, layout/, theme/
src/lib/          DB 조회(posts.ts), 인증, 메타데이터, 경로, 조회수
src/types/        DTO
prisma/           스키마, 마이그레이션, 백업 스크립트
tests/            Playwright e2e
```

구조와 규칙, 인프라 메모는 [CLAUDE.md](CLAUDE.md)에 있다.

## 배포

`main`에 push하면 Vercel이 배포한다. 함수 리전은 `vercel.json`에서 `icn1`로 고정했다. 조회수 동기화 크론도 같은 파일에 있다.
