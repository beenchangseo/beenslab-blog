# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개요

개인 기술 블로그 + 이력서 사이트 (https://blog.beenslab.com). Next.js 16.3 App Router(React 19, Turbopack) + Prisma 6(PostgreSQL), Tailwind CSS 4, Vercel 배포. 게시글/카테고리는 DB에 저장되고 `/admin`의 마크다운 에디터로 작성한다. `README.md`는 create-next-app 기본 템플릿이라 참고할 내용이 없다(포트도 실제와 다름).

DB는 Oracle Cloud 춘천 리전 VM에 직접 띄운 PostgreSQL이다. Vercel 함수 리전은 대시보드 설정으로 `icn1`(서울)이다(`vercel.json` 없음, 새 프로젝트 기본값은 `iad1`). 캐시되지 않은 렌더링(ISR 재생성, API 라우트, 관리자 페이지)은 DB를 거치므로 함수 리전과 DB는 같은 지역에 있어야 한다. DNS는 Cloudflare에서 관리하지만 `blog` 레코드는 프록시를 끈 상태(DNS only)로 둔다. 프록시를 켜면 한국 방문자가 Cloudflare LA를 거쳐 응답이 약 0.7초 느려진다(2026-09 측정).

## 명령어

```bash
npm run dev            # dev 서버, 포트 7777 (Turbopack)
npm run build          # 프로덕션 빌드 (DATABASE_URL 필요: 공개 페이지를 빌드 때 prerender)
npm start              # 포트 7777
npm run lint           # eslint . — next lint는 Next 16에서 삭제됐다
npm run typecheck      # tsc --noEmit
npx prisma generate    # schema.prisma 수정 후 (postinstall에서도 실행됨)
```

- 쉘에 `NODE_ENV=development`가 설정돼 있으면 `next build`가 prerender 단계에서 `Cannot read properties of null (reading 'useContext')`로 실패한다(Next 16에서도 `/career`에서 동일하게 재현) → `NODE_ENV=production npm run build`.
- Prettier는 포맷 스크립트 없이 파일 단위로 실행한다: `npx prettier --write <file>`. `.prettierrc`가 `"parser": "typescript"`를 강제하므로 `.ts/.tsx`에만 쓸 것 (CSS/JSON에 돌리면 파싱 에러). 스타일: 4칸 들여쓰기, single quote, `{foo}`(bracketSpacing false), printWidth 100.
- ESLint는 flat config(`eslint.config.mjs`)다. ESLint 10은 `eslint-config-next`가 번들한 `eslint-plugin-react`와 아직 호환되지 않으므로(`contextOrFilename.getFilename is not a function`) 9.x에 묶어둔다.
- `next dev`가 `CLAUDE.md` 끝에 `nextjs-agent-rules` 블록을 자동으로 다시 써넣는다. 지워도 되살아나므로 그냥 커밋해 둔다.

### 테스트 (Playwright E2E만 있음)

```bash
npx playwright install chromium                                                  # 최초 1회
npx playwright test                                                              # 전체
npx playwright test tests/auth.spec.ts -g "invalid credentials" --reporter=list  # 단일 테스트
```

- `playwright.config.ts`의 `webServer`가 `npm run dev`(7777)를 띄우거나 이미 떠 있는 서버를 재사용한다.
- "redirect to login" 테스트 외에는 실제 DB와 로그인 가능한 계정이 필요하다. seed 스크립트는 저장소에 없다(`scripts/`는 gitignore).
- **2026-09 기준 로그인이 필요한 2개 테스트는 실패한다.** DB에 `beenslab.corp@gmail.com` 계정은 있지만 비밀번호가 `test1234`가 아니다(bcrypt 비교 false). 코드 문제가 아니라 자격증명 불일치이므로, 테스트를 돌리려면 비밀번호를 맞추거나 테스트를 고쳐야 한다.
- `test-results/`와 `playwright-report/`는 gitignore에 있다.

## 환경변수 (`.env-example`)

- `DATABASE_URL`: PostgreSQL (`pgcrypto` 확장 사용)
- `JWT_SECRET`: 미설정 시 `src/lib/auth.ts`가 하드코딩된 placeholder 키로 서명한다
- `KV_REST_API_URL`, `KV_REST_API_TOKEN`: 조회수 카운터용 Upstash Redis. Vercel Marketplace 리소스 `beenslab-blog-hits`(도쿄 `hnd1`, free 플랜, autoUpgrade 끔)가 주입하고, `src/lib/redis.ts`의 `Redis.fromEnv()`가 읽는다. 같이 주입되는 `KV_URL`, `KV_REST_API_READ_ONLY_TOKEN`, `REDIS_URL`은 쓰지 않는다.
- 카운터가 4초쯤 걸린 뒤 500을 내면 Redis 주소에 연결이 안 되는 상황이다. 연결된 리소스가 삭제됐는지 `vercel integration list <project>`로 확인할 것(2026-09에 이전 리소스가 Uninstalled 상태로 방치돼 이 증상이 있었다).

## 아키텍처

### 읽기 경로: `src/lib/posts.ts` → Prisma, 공개 페이지는 ISR 캐시

- 공개 페이지, API 라우트, sitemap이 모두 `src/lib/posts.ts`(`getAllPosts`/`getPostBySlug`/`getCategories`)로 조회한다. 함수들은 `React.cache`로 감싸져 한 렌더 안의 중복 쿼리가 없고, soft delete(`delete_time: null`) 필터와 Date→ISO 문자열 변환도 이 파일 한 곳에서 한다. 새 조회도 여기에 추가할 것. 응답 DTO 타입은 `src/types/blog.ts`.
- `/blog`, `/category`, `/blog/post/[slug]`는 `revalidate = 3600`인 ISR이고, 글 페이지는 `generateStaticParams`로 빌드 때 모두 생성된다. 글을 바꾸는 Server Action은 `revalidatePath('/', 'layout')`로 모든 페이지 캐시를 무효화한다. 단 sitemap(라우트 핸들러)은 Next 14 캐시가 태그 무효화를 적용하지 않아 최대 1시간 뒤에 갱신된다(로컬 `next start`에서 확인, Vercel은 미확인).
- 시간이 지나 만료된 캐시는 DB 장애 중에도 이전 페이지를 계속 제공한다(STALE). 반면 `revalidatePath` 직후의 첫 요청은 블로킹 재생성이라, 그때 DB가 죽어 있으면 500이 난다.
- `/admin/blog`는 최신 목록이 필요해서 `force-dynamic`이다. API 라우트(`/api/blog/posts`, `/api/categories` 등)는 관리자 에디터가 클라이언트에서 호출한다.
- 게시글의 `categories`는 카테고리 **keyword** 문자열 배열이다(id/title 아님). 필터링은 keyword로 하고, 표시용 title은 `getCategories()` 결과로 매핑하며, 에디터는 keyword→id로 바꿔 액션에 `categoryIds`를 넘긴다.
- `/category`는 필터 쿼리를 읽는 `CategoryFilterFromSearchParams`(`useSearchParams`)를 `<Suspense>`로 감싸고, 필터 없는 `CategoryFilter`를 fallback으로 넘긴다. 정적 렌더링 때는 이 fallback이 HTML에 들어가므로, fallback을 비우면 `/category`의 HTML 본문이 사라진다.

### 쓰기 경로: Server Actions (`src/app/actions/`)

- `posts.ts`(create/update/softDelete/permanentlyDelete), `categories.ts`, `auth.ts`가 Prisma를 직접 쓰고 `{success, data | error}`를 반환한다. `categories.ts`는 연결된 UI가 아직 없다(카테고리는 DB에서 직접 관리).
- Slug는 `src/lib/slugify.ts`가 만든다. 한글 제목은 `@romanize/korean`으로 로마자화한 뒤 slugify하고, 중복이면 `-1`, `-2`… 접미사를 붙인다. **수정할 때 제목이 바뀌면 slug도 새로 생성**되므로 기존 URL이 깨지고(리다이렉트 없음) slug를 키로 쓰는 조회수도 초기화된다.
- `Post.title`은 `@unique`이고, soft delete된 글도 이 제약에 포함된다. 수정 시 `PostOnCategory` 조인 행은 트랜잭션 안에서 전부 지우고 다시 만든다.
- 본문은 `post.contents`에 Markdown으로 저장된다. `src/components/Mdx.tsx`는 이름과 달리 MDX가 아니라 `react-markdown` + `remark-gfm` + `rehype-highlight`이고, 본문의 raw HTML은 렌더링되지 않고 텍스트로 보인다(코드 하이라이트 테마는 `globals.css`의 highlight.js import). 게시글용 이미지는 `public/images/`에 커밋해서 정적 파일로 제공한다.
- 마크다운 `![](...)`에는 크기 정보가 없어 그냥 두면 원본을 통째로 받고 레이아웃도 밀린다. `Mdx.tsx`가 `img`를 가로채 `src/lib/imageSize.ts`로 PNG/JPEG 헤더에서 실제 크기를 읽고 `next/image`에 넘긴다(의존성 없이 직접 파싱, `public/` 밖 경로와 외부 URL은 null 반환). 새 이미지 포맷을 쓰려면 이 파서에 추가해야 한다.
- `prisma/migrations`는 없다. 테이블은 snake_case(`@@map`)이고, `OauthClient` 모델은 쓰지 않는다(이전 OAuth 연동 잔재).

### 인증

- 자체 JWT 방식이다. `actions/auth.ts#login`이 bcrypt로 비교한 뒤 `src/lib/auth.ts`가 `jose`(HS256) JWT를 httpOnly 쿠키 `auth-token`(7일)에 저장한다. 회원가입 기능은 없다(User는 DB에 직접 추가). `src/app/lib/auth.ts.backup`은 이전 NextAuth 설정이고 빌드에 포함되지 않는다.
- `src/proxy.ts`가 `/admin/:path*`(`/admin/signin` 제외)에서 JWT를 검증하고 리다이렉트한다. Next 16에서 `middleware` 컨벤션이 `proxy`로 개명됐고(파일명·export 이름 모두), `proxy`는 edge가 아니라 Node 런타임에서 돈다. 클라이언트 컴포넌트(Header의 Login/Logout, 에디터)는 `/api/auth/session`으로 로그인 여부와 `userId`를 가져온다.
- **Server Action은 미들웨어로 보호되지 않는다.** Next 14는 `'use server'` 파일의 export 전부를 그 파일을 import하는 모든 페이지에 등록한다. 예를 들어 `BlogPost.tsx`를 통해 공개 페이지 `/blog`, `/category`에도 `posts.ts`의 액션이 전부 등록된다. 그래서 데이터를 바꾸는 액션(`posts.ts`, `categories.ts`)은 첫머리에서 `getSession()`을 검사해 `{success: false, error: 'Unauthorized'}`를 반환하고, 작성자는 클라이언트 입력이 아니라 세션의 `userId`로 정한다. 새 액션도 같은 패턴을 따를 것.

### 라우트 구성

- 루트 `src/app/layout.tsx`는 CSS를 import하지 않고, route group 레이아웃이 각자 `globals.css`를 import한다. `(root-layout)`은 Header/Footer로 감싸고(관리자 페이지 포함), `(no-layout)`은 `/admin/signin` 전용이다. 새 route group을 만들면 `globals.css` import가 필요하다.
- 관리자 기능: `/admin/blog`(목록 + 수정/삭제), `/admin/board/editor`(작성), `/admin/board/editor/[slug]`(수정). `/admin` 대시보드는 대부분 동작하지 않는 placeholder다.
- 조회수: 게시글 페이지가 `/api/blog/count?post_id={slug}&domain=blog.beenslab.com`을 `<Image unoptimized>`로 렌더하면, 이 라우트가 `blog-hits:{domain}:{slug}:total`과 `...:{KST 날짜}`(48시간 TTL) 키를 `INCR` 파이프라인으로 올리고 SVG 배지를 반환한다. `domain`은 `blog.beenslab.com`만, `post_id`는 slug 형식만 허용한다. Edge 런타임은 프로젝트 리전 설정을 따르지 않아 `sin1`(싱가포르)에서 실행됐기 때문에, Node 런타임으로 두어 `icn1`에서 실행되게 한다.
- `/career`는 DB와 무관한 클라이언트 페이지이고 내용은 전부 `src/data/career.ts`에 있다(메타데이터는 `career/layout.tsx`).
- SEO: 각 페이지가 `metadata`/`generateMetadata`에 canonical·OpenGraph·Twitter를 직접 정의하고, 게시글 페이지는 JSON-LD를 넣는다. 도메인 `https://blog.beenslab.com`이 metadata·JSON-LD·`robots.ts`·sitemap에 하드코딩돼 있다(`src/types/constants.ts`의 `BASE_URL`은 root layout 메타데이터에서만 쓴다).
- OG 이미지는 `src/app/opengraph-image.tsx`/`twitter-image.tsx`가 1200×630으로 생성한다(한글도 정상 렌더). **각 페이지는 `images: [{url: '/opengraph-image', ...}]`로 이 라우트를 직접 가리켜야 한다.** Next는 메타데이터를 얕게 병합해서, 자식 세그먼트가 `openGraph`를 정의하면 루트의 파일 컨벤션 이미지까지 통째로 사라진다. 새 페이지를 만들 때 빠뜨리기 쉬우니 주의.
- 레이아웃에서 페이지 전체를 `<Suspense>`로 감싸지 말 것. 예전에 루트 layout이 그렇게 되어 있어서, 없는 글이나 DB 장애 같은 렌더 에러가 HTTP 200 + 빈 body(soft 404)로 응답됐다. 지금은 없는 글이면 `notFound()`로 404, 렌더 에러면 500이 나간다.

### 스타일

- Tailwind CSS 4다. **설정 파일(`tailwind.config.ts`)이 없다.** 폰트 스택·커스텀 값은 `src/app/globals.css`의 `@theme` 블록에, 플러그인은 `@plugin "@tailwindcss/typography";`로 선언한다. v4는 JS 설정을 자동으로 찾지 않으므로 플러그인 줄을 빠뜨리면 본문 `prose` 스타일이 통째로 사라진다.
- `globals.css`의 `@import`는 반드시 맨 위에 둘 것. Turbopack CSS 파서가 순서를 어기면 빌드를 실패시킨다.
- v3의 기본 border 색(`gray-200`)을 유지하려고 `globals.css` 하단에 호환 레이어를 둔다. 색을 지정하지 않은 `border` 클래스들이 여기에 의존한다(주로 `src/components/career/*`).
- 한글 폰트는 Pretendard 동적 서브셋을 jsDelivr CDN에서 불러온다(`src/app/layout.tsx`). `fontFamily.mono` 스택 뒤쪽에도 Pretendard를 넣어, 등폭 폰트에 글리프가 없는 한글만 폴백되게 한다.

### 사용하지 않는 잔재

MDX+contentlayer(GitHub Pages) → 외부 백엔드 API + NextAuth OAuth → 현재 구조(2026-01)로 옮겨온 흔적. 의존성(`firebase`, `axios`, `recoil`, `shiki`, `rehype-pretty-code`, `@types/next-auth`), `next-contentlayer` override, `styledComponents` 옵션, 동작하지 않던 `deploy`/`predeploy` 스크립트는 2026-09에 제거했다. 남은 것: `src/data/category.ts`(카테고리는 DB로 이동), `src/app/lib/auth.ts.backup`(이전 NextAuth 설정, 빌드 미포함), `OauthClient` 모델.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
