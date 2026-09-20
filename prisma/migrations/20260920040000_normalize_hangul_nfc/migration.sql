-- 한글을 NFC로 정규화 (데이터 마이그레이션)
--
-- macOS에서 복사한 텍스트는 한글이 NFD(자모 분리) 상태로 들어온다.
-- 브라우저는 알아서 합쳐 보여주지만, 커버 이미지를 그리는 Satori는
-- 자모 블록(U+1100~U+11FF) 글리프를 못 찾아 전부 두부(□)로 렌더했다.
-- 검색과 정렬도 NFC/NFD가 섞이면 어긋난다.
--
-- 2026-09 기준 제목 1건(singleton-dependency-injection-ioc, 94자 -> 47자)과
-- 본문 1건(aws-cost-optimization-candle)이 NFD였다.

UPDATE "post"
SET "title" = normalize("title", NFC),
    "description" = normalize("description", NFC),
    "contents" = normalize("contents", NFC),
    "tags" = ARRAY(SELECT normalize(t, NFC) FROM unnest("tags") AS t)
WHERE normalize("title", NFC) <> "title"
   OR normalize("description", NFC) <> "description"
   OR normalize("contents", NFC) <> "contents"
   OR EXISTS (SELECT 1 FROM unnest("tags") AS t WHERE normalize(t, NFC) <> t);

UPDATE "category"
SET "title" = normalize("title", NFC)
WHERE normalize("title", NFC) <> "title";

UPDATE "series"
SET "title" = normalize("title", NFC),
    "description" = normalize("description", NFC)
WHERE normalize("title", NFC) <> "title"
   OR normalize("description", NFC) <> "description";
