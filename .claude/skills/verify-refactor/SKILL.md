---
name: verify-refactor
description: 동작을 바꾸지 않아야 하는 변경(파일 이동, 이름 변경, 중복 제거, 컴포넌트 분리)이 정말 같은 결과를 내는지 빌드 두 개를 비교해 확인할 때 쓴다. "리팩터링", "구조 정리", "전과 같은지 확인" 같은 요청에 쓴다.
---

# 리팩터링 동작 비교

`tests/support/snapshot.ts`는 실행 중인 빌드가 내는 응답을 디렉터리에 기록한다. 바꾸기 전과 후를 각각 기록하고 `diff -r`로 비교한다.

기록하는 것은 다음과 같다.

- sitemap의 모든 URL과, 404·리다이렉트가 나야 하는 경로의 상태 코드, Location, 정규화한 HTML. 스크립트와 빌드 해시는 지운다.
- OG·커버·아이콘 이미지의 sha256.
- 관리자 페이지 응답. 세션이 있을 때와 없을 때 둘 다 기록한다.
- 에디터의 폼 상태, 검증 메시지 순서, 저장 버튼이 보내는 Server Action 인자(`editors.json`).

이 도구는 DB의 행을 바꾸지 않는다. 저장 요청은 가로채서 버린다. 삭제 요청은 없는 글 id(nil UUID)로 바꿔 실제로 보내므로, `softDeletePost`의 UPDATE가 운영 DB에서 실행되고 맞는 행이 없어 실패한다. 세션 확인이 통과하는지 보려는 의도다. 조회수를 올리는 `/api/blog/count`는 요청하지 않는다.

## 순서

1. 바꾸기 전 커밋에서 빌드하고 기록한다.
   ```bash
   npm run build
   NODE_ENV=production npx next start -p 7801 &
   npm run snapshot -- http://localhost:7801 /tmp/snap-before
   ```
   `NODE_ENV=production`을 빼지 않는다. `next start`는 셸에 이미 있는 `NODE_ENV`를 그대로 쓴다. 이 값이 `production`이 아니면 Prisma가 에러 메시지에 호출 위치의 압축된 서버 코드 한 줄을 붙인다. 그 줄은 번들이 바뀌면 함께 바뀌므로, 동작이 같은 리팩터링이어도 전후 빌드의 `editors.json` 삭제 프로브 기록이 달라진다. 같은 빌드를 두 번 기록하는 4단계로는 이 차이가 드러나지 않는다.
2. 서버를 끄고, 변경을 적용한 뒤 같은 방식으로 `/tmp/snap-after`에 기록한다.
3. `diff -r /tmp/snap-before /tmp/snap-after`를 본다. 리팩터링이라면 비어 있어야 한다. 차이가 있으면 의도한 변경인지 하나씩 확인하고 커밋 메시지에 적는다.
4. 처음 한 번은 같은 빌드를 두 번 기록해서 diff가 비는지 본다. 기준선이 흔들리면 비교 결과를 믿을 수 없다.

## 주의

- 공개 페이지는 운영 DB를 읽는다. 두 기록 사이에 글이 바뀌면 그 차이가 diff에 섞인다.
- 관리자 페이지 안의 `redirect()`와 `notFound()`는 `admin/loading.tsx`의 Suspense 경계 때문에 200으로 응답한다. 상태 코드가 같아도 화면은 브라우저에서 확인한다(`tests/smoke.spec.ts`).
- 정규화가 지우는 값은 diff에 나오지 않는다. 특히 `og:image`·`twitter:image` URL의 쿼리(`?c916a5c052e4120c`)는 이미지 라우트 소스 파일의 해시라서, `opengraph-image.tsx`나 `twitter-image.tsx`를 고치면 주석만 바꿔도 값이 바뀐다. 이미지 sha256이 같으면 SNS가 한 번 다시 받아갈 뿐이지만, 커밋 메시지에는 적는다.
- 기록에는 운영 글 내용이 들어 있으니 저장소에 커밋하지 않는다.
