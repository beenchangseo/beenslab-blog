# CLAUDE.md

개인 기술 블로그와 이력서 사이트(https://blog.beenslab.com)다. Next.js 16.3 App Router(React 19, Turbopack), Prisma 6(PostgreSQL 16), Tailwind CSS 4로 만들었고 Vercel에 배포한다. 글과 카테고리는 DB에 있고 `/admin`의 마크다운 에디터로 쓴다.

이 파일에는 코드만 봐서는 알 수 없는 사실과 깨면 안 되는 규칙을 적는다. 순서가 있는 작업은 프로젝트 스킬에 있다.

| 작업 | 스킬 |
| --- | --- |
| 스키마 변경, 운영 데이터 수정 | `.claude/skills/db-migration` |
| 동작을 바꾸지 않는 구조 변경 확인 | `.claude/skills/verify-refactor` |
| 공개 페이지 추가, 메타데이터·캐시 변경 | `.claude/skills/add-page` |

## 명령어

```bash
npm run dev            # 개발 서버, 포트 7777
npm run check          # typecheck + lint + format:check + test:hooks. 커밋 전에 돌린다
npm run build          # 프로덕션 빌드. 공개 페이지를 prerender하므로 DATABASE_URL이 필요하다
npm run test:e2e       # Playwright. 개발 서버를 띄우거나 떠 있는 서버를 재사용한다
npm run format         # ts, tsx, mjs에 prettier
npm run snapshot -- <baseUrl> <outDir>   # 빌드 비교용 응답 기록 (verify-refactor 스킬)
npm run db:backup      # blog 스키마 덤프 (~/beenslab-blog-backups)
npm run migrate:new -- <이름> / migrate:deploy / migrate:status
```

- 최초 1회 `npx playwright install chromium`.
- `next dev`는 이 파일 끝에 `nextjs-agent-rules` 블록을 다시 써넣는다. 지워도 되살아나므로 그대로 커밋한다.
- ESLint는 9.x에 묶여 있다. 10은 `eslint-config-next`가 번들한 `eslint-plugin-react`와 호환되지 않는다(`contextOrFilename.getFilename is not a function`).

## Claude Code hook

`.claude/settings.json`에 있다. 동작을 바꾸려면 `.claude/hooks/`의 스크립트를 고친다.

- Bash에서 `prisma migrate dev`, `prisma migrate reset`, `prisma db push`를 실행하면 막힌다. 정규식이 까다로우니 고칠 때는 `.claude/hooks/guard-bash.test.mjs`에 케이스를 더하고 `npm run test:hooks`(`check`에 포함)로 확인한다.
- 파일을 고치면 그 파일에 prettier를 돌리고, eslint 결과(경고 포함)를 돌려준다.
- 턴을 끝낼 때 바뀐 `.ts`/`.tsx`가 있으면 `npm run typecheck`를 돌리고, 실패하면 끝내지 않는다.

## 디렉터리

```
src/
├── app/                    라우트만 둔다
│   ├── (root-layout)/      헤더·푸터가 있는 페이지. 공개 페이지와 /admin/blog, 에디터
│   ├── (no-layout)/        /admin/signin
│   ├── actions/            Server Action. 쓰기는 전부 여기서 Prisma를 직접 쓴다
│   ├── api/                세션 확인, 조회수 배지, 조회수 동기화 크론
│   ├── rss.xml/ sitemap.xml/ robots.ts
│   └── opengraph-image.tsx, twitter-image.tsx, icon.tsx, apple-icon.tsx
├── components/
│   ├── admin/              PostEditor(작성·수정 공용), postDraft.ts(폼 모델), AdminPostList/Item
│   ├── blog/               PostCard, PostGrid, Markdown, TableOfContents, Pagination 등
│   ├── career/             /career 전용
│   ├── layout/             Header, Footer, Nav, Container, Layout
│   └── theme/              ThemeProvider, ThemeToggle
├── lib/                    서버 로직과 순수 함수
│   ├── posts.ts            모든 읽기 조회. Date → ISO 문자열 변환도 여기서
│   ├── auth.ts             JWT 세션, requireSession()
│   ├── site.ts, paths.ts, metadata.ts   사이트 주소, 앱 내부 경로, 페이지 메타데이터
│   ├── views.ts            Redis 조회수 키와 DB 동기화
│   └── postCover.tsx, postImage.ts, imageSize.ts, toc.ts, slugify.ts, prisma.ts, redis.ts
├── data/career.ts          이력서 내용 (DB와 무관)
├── types/blog.ts           DTO: PostSummary, PostDetail, Category, Series
└── proxy.ts                /admin/* 인증 (Next 16에서 middleware가 proxy로 개명됨)
tests/                      Playwright e2e, tests/support/(세션 쿠키, 스냅샷 도구)
prisma/                     schema.prisma, migrations/, backup.mjs, create-migration.mjs
```

## 규칙

ESLint가 강제하는 것이 셋 있다. `src/components`는 `@/lib/prisma`, `@/lib/redis`, `@prisma/client`를 import할 수 없다. `src/app`은 `actions/`를 빼고 `@/lib/prisma`를 import할 수 없다. `src` 안에서는 `../` 상대경로 import 대신 `@/`를 쓴다.

### 읽기와 쓰기

- 읽기는 `src/lib/posts.ts`의 `React.cache` 함수로만 한다. 공개 조회는 `delete_time: null`과 `status: 'PUBLISHED'`를 함께 거른다. 초안이 필요한 `getAllPostsForAdmin`과 `getPostBySlugForAdmin`은 함수 안에서 `requireSession()`을 호출한다.
- 공개 목록은 `published_at` 순이다. `published_at`은 초안이 처음 발행될 때만 찍힌다.
- 쓰기 액션은 `src/app/actions/posts.ts`의 `adminAction()`으로 감싼다. 세션 확인, `{success, data | error}` 형태, `revalidatePath('/', 'layout')`를 이 함수가 한다. Server Action은 그 액션을 import한 라우트로 POST하면 실행된다. 지금은 액션을 import하는 페이지가 모두 `/admin` 아래라 proxy가 먼저 막지만, 공개 페이지가 액션을 import하는 순간 세션 없이 불릴 수 있다. 그래서 새 액션도 반드시 이 함수를 거친다.
- 저장하기 전에 문자열을 `normalize('NFC')`한다. macOS에서 복사한 한글은 NFD로 들어오고, 커버 이미지를 그리는 Satori는 NFD 자모를 두부(□)로 그린다.
- 게시글의 `categories`는 카테고리 **keyword** 배열이다. 에디터는 keyword를 id로 바꿔 `categoryIds`로 넘긴다(`draftFromPost`).
- slug는 제목을 로마자로 바꿔 만든다(`src/lib/slugify.ts`). 제목이 바뀌면 slug도 바뀌고, 옛 slug는 `post_slug_history`에 남아 글 페이지가 308로 넘겨준다. 조회수 Redis 키는 slug 기준이라 제목을 바꾸면 조회수가 0부터 다시 센다.
- DTO 필드는 DB 컬럼 이름(snake_case)을 그대로 쓴다.

### 캐시와 렌더링

- `/`, `/blog`, `/blog/page/[n]`, `/category`, `/category/[keyword]`, `/blog/post/[slug]`는 `revalidate = 3600`인 ISR이고 빌드 때 생성된다. 검색은 `force-dynamic`인 `/search`로 따로 뺐다. 목록 페이지에서 `searchParams`를 읽으면 페이지 전체가 동적이 된다.
- `/category?filter=x`와 `/admin`의 리다이렉트는 `next.config.js`에 있다. 페이지 안에서 처리하면 `/category`는 동적이 되고 `/admin`은 200으로 응답한다.
- 공개 경로에 `loading.tsx`를 두거나 페이지를 `<Suspense>`로 감싸지 않는다. 렌더 에러와 `notFound()`가 HTTP 200에 빈 본문(soft 404)으로 나간다. `/admin`에는 `loading.tsx`가 있어서, 관리자 페이지 안의 `notFound()`와 `redirect()`는 200으로 응답한다.
- `(root-layout)` 안의 `notFound()`는 `(root-layout)/not-found.tsx`가 그룹 레이아웃 안에 그린다. 루트 `app/not-found.tsx`는 일치하지 않는 URL에만 쓰이고 헤더가 없는 루트 레이아웃 아래에 그려지므로 `Layout`으로 감싼다. 그룹 쪽에서도 `Layout`으로 감싸면 헤더와 푸터가 두 번 나온다.
- SQL로 데이터를 직접 바꾸면 `revalidatePath`가 불리지 않는다. 공개 페이지는 ISR이 만료될 때까지(최대 1시간) 옛 내용을 보여준다.
- 시간이 지나 만료된 캐시는 DB 장애 중에도 이전 페이지를 계속 내보낸다. 반면 `revalidatePath` 직후의 첫 요청은 블로킹 재생성이라, 그때 DB가 죽어 있으면 500이 난다.

### 메타데이터와 이미지

- 페이지 메타데이터는 `pageMetadata()`로 만든다. Next는 메타데이터를 얕게 병합해서, 자식이 `openGraph`를 정의하면 루트의 파일 컨벤션 OG 이미지가 사라진다. 헬퍼는 `/opengraph-image`를 직접 가리킨다. 같은 세그먼트에 둔 `opengraph-image.tsx`는 자동 적용되므로 글 페이지는 헬퍼를 쓰지 않는다.
- RSS 자동발견 `<link>`는 루트 layout의 `<head>`에 직접 넣었다. `metadata.alternates.types`에 넣으면 페이지가 `alternates.canonical`을 정의할 때 덮인다.
- 글 커버는 `src/lib/postCover.tsx`가 그리고 진입점이 둘이다. `opengraph-image.tsx`는 공유용이고, Next가 URL에 해시 접미사(`opengraph-image-3kwzem`)와 쿼리를 붙여서 코드에서 링크하기 어렵다. `cover/route.ts`는 목록 썸네일용 고정 주소다. UI에서는 `getPostThumbnail()`을 쓴다.
- 본문 `![](...)`에는 크기가 없어서 `Markdown.tsx`가 `src/lib/imageSize.ts`로 PNG/JPEG 헤더를 읽어 `next/image`에 넘긴다. 다른 포맷을 쓰려면 파서에 추가한다. 글 이미지는 `public/images/`에 커밋한다.
- `Markdown.tsx`는 react-markdown + remark-gfm + rehype-highlight다. 본문의 raw HTML은 텍스트로 보인다. 본문 `h1`은 `h2`로 내려 그린다.
- 목차 id는 `Markdown.tsx`와 `extractHeadings()`가 `createHeadingIdFactory()`를 같은 순서로 호출해서 맞춘다. 한쪽만 고치면 앵커가 어긋난다.

### 스타일

- Tailwind 4이고 설정 파일이 없다. 폰트와 토큰은 `src/app/globals.css`의 `@theme`에 있고, 플러그인은 `@plugin "@tailwindcss/typography";`로 불러온다. 이 줄이 빠지면 본문 `prose` 스타일이 전부 사라진다.
- `globals.css`의 `@import`는 맨 위에 둔다. Turbopack CSS 파서는 순서를 어기면 빌드를 실패시킨다.
- 색은 의미 토큰(`bg-surface`, `text-ink`, `text-ink-muted`, `border-line`, `text-brand-600`)을 쓰고 `dark:` 변형을 새로 쓰지 않는다. 다크 모드 토큰 블록은 일부러 `@layer` 밖에 있다. 안에 두면 `@theme`이 내보내는 밝은 값에 밀려 다크 모드가 통째로 안 먹는다.
- `globals.css` 하단의 호환 레이어가 v3 기본 border 색(`gray-200`)을 유지한다. 색을 지정하지 않은 `border` 클래스(주로 `src/components/career/*`)가 여기에 의존한다.
- 폭은 페이지가 `Container`로 정한다(목록 72rem, 본문 46rem).
- 루트 `src/app/layout.tsx`는 CSS를 import하지 않는다. route group layout, `not-found.tsx`, `error.tsx`가 각자 import한다.

### 인증

- `actions/auth.ts#login`이 bcrypt로 비교하고, `src/lib/auth.ts`가 jose(HS256) JWT를 httpOnly 쿠키 `auth-token`(7일)에 넣는다. 회원가입은 없고 User는 DB에 직접 넣는다.
- `JWT_SECRET`이 없으면 서명과 검증이 에러를 낸다. 대체 키는 없다.
- `src/proxy.ts`는 edge가 아니라 Node 런타임에서 돈다. 헤더의 Logout 버튼은 `/api/auth/session`으로 로그인 여부를 확인한다.

### 조회수

- 글 페이지가 `/api/blog/count?post_id={slug}&domain=blog.beenslab.com`을 `<Image unoptimized>`로 그리면, 라우트가 Redis의 total 키와 KST 날짜 키(48시간 TTL)를 `INCR`하고 SVG 배지를 돌려준다. 키 형식은 `src/lib/views.ts`에 있다.
- 이 라우트는 Node 런타임이어야 한다. Edge 런타임은 프로젝트 리전 설정을 따르지 않아 `sin1`(싱가포르)에서 돌았다.
- `post.view_count`는 인기 글 정렬용 사본이다. Vercel Cron이 하루 한 번(`vercel.json`, 18:00 UTC = 03:00 KST) `/api/cron/sync-views`로 옮긴다. Hobby 플랜은 크론을 하루 1회로 제한하고(더 잦으면 배포가 실패한다) 실행 시각에 ±59분 오차가 있다. 수동 실행은 `curl -H "Authorization: Bearer $CRON_SECRET" https://blog.beenslab.com/api/cron/sync-views`.
- 카운터가 4초쯤 걸리다 500을 내면 Redis에 연결되지 않는 상태다. `vercel integration list <project>`로 연결된 리소스(`beenslab-blog-hits`, 도쿄 `hnd1`)가 살아 있는지 본다.

### 테스트

- `tests/support/session.ts`가 `.env`의 `JWT_SECRET`으로 관리자 쿠키를 만든다. 실제 비밀번호 로그인 테스트는 `E2E_ADMIN_EMAIL`과 `E2E_ADMIN_PASSWORD`가 있을 때만 돈다.
- 글 페이지를 브라우저로 여는 테스트를 쓰지 않는다. 조회수 배지가 운영 Redis를 올린다. 공개 페이지는 `request` fixture로 받는다.
- 테스트도 운영 DB를 읽는다. 저장 버튼을 누르는 테스트를 쓰지 않는다.

### 코드 스타일

- Prettier: 4칸 들여쓰기, single quote, `{foo}`(bracketSpacing false), printWidth 100.
- 코드 주석은 영어로 쓰고, 코드가 보여주지 못하는 이유만 적는다. 문서와 UI 문구는 한국어다.
- 컴포넌트 파일은 PascalCase, `lib`의 파일은 camelCase다. 앱 내부 경로는 `src/lib/paths.ts`, 사이트 주소는 `src/lib/site.ts`로 만든다.
- 커밋 메시지는 Conventional Commits 형식에 한국어 요약이다(`refactor: ...`, `fix: ...`).

## 인프라

- DB는 Oracle Cloud 춘천 VM의 도커 PostgreSQL 16이다(컨테이너 `postgres`, `ssh emotiontree`). 같은 인스턴스에 `emotion_tree` DB가 있으니 서버 전역 설정을 바꾸지 않는다. 테이블은 `public`이 아니라 `blog` 스키마에 있고, 접속 문자열의 `?schema=blog`가 `search_path`를 잡는다.
- 로컬 개발과 운영이 DB 하나를 공유한다. 스키마 변경은 db-migration 스킬을 따른다.
- 앱은 DML만 가능한 `beenslab_app` 롤로 붙는다. 마이그레이션과 백업은 `DIRECT_URL`의 테이블 소유자 `postgres`로 돈다.
- 접속은 `sslmode=require`다. 암호화는 되지만 서버 신원은 검증하지 않는다. `pg_hba.conf` 마지막 줄이 아직 `host`라 평문 접속도 열려 있다. `hostssl`로 바꾸기 전에 `emotion_tree` 쪽 앱이 TLS로 붙는지 확인해야 한다. 5432 포트는 공용 인터넷에 열려 있다(Vercel Hobby는 고정 IP가 없다).
- Vercel 프로젝트 이름은 `beenchangseo-github-io`이고, Git 연동으로 `main`에 push하면 Production에 배포된다. 다른 브랜치는 `vercel.json`의 `git.deploymentEnabled`가 빌드하지 않게 막는다. `DATABASE_URL`이 Production에만 있어서 Preview 빌드는 prerender 단계에서 실패하기 때문이다. 패턴은 minimatch라 `*`는 `fix/...`처럼 `/`가 든 브랜치에 맞지 않으므로 `**`를 쓴다.
- Vercel 함수 리전은 `vercel.json`의 `regions: ["icn1"]`(서울)이다. 캐시되지 않은 렌더링은 DB를 거치므로 리전이 바뀌면 지연이 크게 는다.
- DNS는 Cloudflare다. `blog` 레코드는 프록시를 끈 상태(DNS only)로 둔다. 프록시를 켜면 한국 방문자가 Cloudflare LA를 거쳐 약 0.7초 느려진다(2026-09 측정).

## 환경변수 (`.env-example`)

| 이름 | 용도 |
| --- | --- |
| `DATABASE_URL` | 런타임. `beenslab_app` 롤 |
| `DIRECT_URL` | 마이그레이션과 백업. 로컬에만 두고 Vercel에는 넣지 않는다 |
| `JWT_SECRET` | 세션 서명. 필수 |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | 조회수 Redis. Vercel Marketplace 리소스가 주입하고 `Redis.fromEnv()`가 읽는다 |
| `CRON_SECRET` | 조회수 동기화 크론 인증. 없으면 라우트가 503 |

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
