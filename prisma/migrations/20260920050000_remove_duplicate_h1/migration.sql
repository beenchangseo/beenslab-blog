-- 제목과 겹치는 본문 h1 제거 (데이터 마이그레이션)
--
-- 글 페이지가 이미 제목을 h1으로 그리는데, 본문 첫 줄에도 같은 제목이
-- h1으로 또 있어서 독자가 같은 문장을 연달아 두 번 읽게 됐다.
-- 렌더 단계에서 h1을 h2로 내려 구조 문제(페이지당 h1 1개)는 이미 해결했고,
-- 여기서는 글자 그대로 겹치는 5개만 그 줄을 지운다.
--
-- 제목이 다른(= 도입부 소제목으로 쓴) 글들은 건드리지 않는다.
-- 맨 앞의 "# ...", 빈 줄 두 개만 정확히 걷어낸다.

UPDATE "post"
SET "contents" = regexp_replace("contents", '^#[^\n]*\n\n', '')
WHERE "slug" IN (
    'postgresql-index-not-used',
    'blog-visitor-counter-build',
    'postgresql-read-replica',
    'android-to-iphone-photo-metadata-fix',
    'event-emitter-with-async'
)
AND "contents" ~ '^#[^\n]*\n\n';
