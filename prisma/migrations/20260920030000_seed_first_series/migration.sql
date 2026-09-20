-- 첫 시리즈 등록 (데이터 마이그레이션)
--
-- 제목에 '1편/2편'이 붙어 있는데도 서로 묶여 있지 않아 독자가 다음 편을
-- 찾을 방법이 없었다. 시리즈 생성 UI는 아직 없으므로 여기서 직접 넣는다.

INSERT INTO "series" ("slug", "title", "description")
VALUES (
    'crypto-exchange-db-performance',
    '암호화폐 거래소 DB 성능 개선기',
    '37TB까지 불어난 거래소 데이터베이스의 성능 저하를 분석하고, 데이터 클렌징과 Aurora I/O-Optimized 도입으로 해결한 과정.'
)
ON CONFLICT ("slug") DO NOTHING;

UPDATE "post" p
SET "series_id" = s."id",
    "series_order" = m."order"
FROM (VALUES
    ('data-clean-project-1', 1),
    ('data-clean-project-2', 2)
) AS m(slug, "order")
JOIN "series" s ON s."slug" = 'crypto-exchange-db-performance'
WHERE p."slug" = m.slug;
