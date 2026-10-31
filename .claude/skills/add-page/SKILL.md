---
name: add-page
description: 공개 페이지(블로그 목록, 글, 카테고리처럼 src/app/(root-layout) 아래 라우트)를 새로 만들거나, 기존 페이지의 메타데이터·캐시·DB 조회 방식을 바꿀 때 쓴다.
---

# 공개 페이지 추가

## 순서

1. 라우트는 `src/app/(root-layout)/` 아래에 둔다. 헤더와 푸터는 이 그룹의 layout이 그린다. 새 route group을 만들면 그 layout에서 `@/app/globals.css`를 import한다.
2. DB 조회는 `src/lib/posts.ts`에 `React.cache`로 감싼 함수를 추가해서 쓴다. 공개 조회에는 `publicWhere`(soft delete 제외, `PUBLISHED`만)를 건다. 페이지에서 `@/lib/prisma`를 import하면 lint가 막는다.
3. 캐시 방식을 정한다. 목록과 글처럼 누구에게나 같은 페이지는 `export const revalidate = 3600`을 두고, 동적 세그먼트가 있으면 `generateStaticParams`도 둔다. `searchParams`를 읽으면 페이지 전체가 동적이 된다. 쿼리가 필요하면 `/search`처럼 별도 경로로 뺀다.
4. 메타데이터는 `src/lib/metadata.ts`의 `pageMetadata()`로 만든다. Next는 메타데이터를 얕게 병합하므로, 페이지가 `openGraph`를 직접 정의하면 루트의 OG 이미지가 빠진다. 헬퍼가 `/opengraph-image`와 canonical을 채운다.
5. 경로 문자열은 `src/lib/paths.ts`의 `postPath`, `categoryPath`, `blogPagePath`로 만든다. 사이트 주소는 `src/lib/site.ts`의 `SITE_URL`과 `absoluteUrl()`을 쓴다.
6. 폭은 페이지가 정한다. 목록은 `<Container>`(72rem), 본문은 `<Container width="reading">`(46rem)이다.
7. 색은 의미 토큰(`bg-surface`, `text-ink`, `text-ink-muted`, `border-line`, `text-brand-600`)을 쓴다. 새 `dark:` 변형을 쓰지 않는다.
8. 검색엔진에 노출할 페이지면 `src/app/sitemap.xml/route.ts`에 추가한다.
9. `tests/smoke.spec.ts`의 `PUBLIC_PAGES`에 경로를 추가하고 `npm run check`와 `npm run test:e2e`를 돌린다.

## 하지 말 것

- 공개 경로에 `loading.tsx`를 두거나 페이지 전체를 `<Suspense>`로 감싸지 않는다. 렌더 에러와 `notFound()`가 HTTP 200에 빈 본문(soft 404)으로 나간다.
- 글 페이지를 브라우저로 여는 테스트를 쓰지 않는다. 조회수 배지 이미지가 운영 Redis 카운트를 올린다. `request` fixture로 HTML만 받는다.
