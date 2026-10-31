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

이 도구는 DB에 쓰지 않는다. 저장 요청은 가로채서 버리고, 삭제 요청은 없는 글 id로 바꿔 보낸다. 조회수를 올리는 `/api/blog/count`는 요청하지 않는다.

## 순서

1. 바꾸기 전 커밋에서 빌드하고 기록한다.
   ```bash
   npm run build
   npx next start -p 7801 &
   npm run snapshot -- http://localhost:7801 /tmp/snap-before
   ```
2. 서버를 끄고, 변경을 적용한 뒤 같은 방식으로 `/tmp/snap-after`에 기록한다.
3. `diff -r /tmp/snap-before /tmp/snap-after`를 본다. 리팩터링이라면 비어 있어야 한다. 차이가 있으면 의도한 변경인지 하나씩 확인하고 커밋 메시지에 적는다.
4. 처음 한 번은 같은 빌드를 두 번 기록해서 diff가 비는지 본다. 기준선이 흔들리면 비교 결과를 믿을 수 없다.

## 주의

- 공개 페이지는 운영 DB를 읽는다. 두 기록 사이에 글이 바뀌면 그 차이가 diff에 섞인다.
- 관리자 페이지 안의 `redirect()`와 `notFound()`는 `admin/loading.tsx`의 Suspense 경계 때문에 200으로 응답한다. 상태 코드가 같아도 화면은 브라우저에서 확인한다(`tests/smoke.spec.ts`).
- 기록에는 운영 글 내용이 들어 있으니 저장소에 커밋하지 않는다.
