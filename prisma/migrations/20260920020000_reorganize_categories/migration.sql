-- 카테고리 재편 (데이터 마이그레이션, 스키마 변경 없음)
--
-- 기존 카테고리 8개는 사실 기술 스택 라벨이라(Javascript, AWS, PostgreSQL...)
-- 상단 네비에 올릴 수 없었다. 기술 영역 기준 4개로 줄이고, 원래 keyword는
-- 정보가 사라지지 않게 각 글의 tags로 옮긴다.
--
-- 매핑은 글 제목을 직접 보고 정한 것이라 SQL 안에 slug로 박아둔다.

-- 1) 기존 카테고리 keyword를 태그로 이관.
--    태그에 이미 같은 말이 대소문자만 다르게 들어있는 경우가 많아 중복을 거른다.
--    'other'는 아무 정보도 담고 있지 않으므로 옮기지 않는다.
UPDATE "post" p
SET "tags" = p."tags" || ARRAY(
    SELECT c."keyword"
    FROM "post_on_category" poc
    JOIN "category" c ON c."id" = poc."category_id"
    WHERE poc."post_id" = p."id"
      AND c."keyword" <> 'other'
      AND NOT EXISTS (
          SELECT 1 FROM unnest(p."tags") AS t WHERE lower(t) = lower(c."keyword")
      )
);

-- 2) 기존 연결과 카테고리 제거. 새 keyword 중 'infra'가 기존과 겹쳐서
--    먼저 비우지 않으면 유니크 제약에 걸린다.
DELETE FROM "post_on_category";
DELETE FROM "category";

-- 3) 새 카테고리. 이모지 없이 상단 네비에 그대로 쓸 수 있는 이름으로 둔다.
INSERT INTO "category" ("keyword", "title") VALUES
    ('backend', 'Backend'),
    ('database', 'Database'),
    ('infra', 'Infra'),
    ('etc', '기타');

-- 4) 글 19개를 새 카테고리에 배치.
INSERT INTO "post_on_category" ("post_id", "category_id")
SELECT p."id", c."id"
FROM (VALUES
    ('event-emitter-with-async', 'backend'),
    ('transactional-outbox-async-pattern', 'backend'),
    ('singleton-dependency-injection-ioc', 'backend'),
    ('esm-migration-undefined-circular-dependency', 'backend'),
    ('redis-lua-rate-limiter', 'backend'),
    ('github-actions-npm-publish', 'backend'),

    ('data-clean-project-1', 'database'),
    ('data-clean-project-2', 'database'),
    ('postgresql-index-not-used', 'database'),
    ('postgresql-read-replica', 'database'),
    ('redis-pipeline-transaction-lua', 'database'),
    ('redis-execabort-transaction-error', 'database'),

    ('aws-cost-optimization-candle', 'infra'),
    ('localstack-offline-aws', 'infra'),
    ('minio-local-s3-alternative', 'infra'),
    ('kubernetes-pod-nginx-websocket', 'infra'),
    ('blog-visitor-counter-build', 'infra'),

    ('android-to-iphone-photo-metadata-fix', 'etc'),
    ('markdown-edit', 'etc')
) AS m(slug, keyword)
JOIN "post" p ON p."slug" = m.slug
JOIN "category" c ON c."keyword" = m.keyword;
