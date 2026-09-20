-- CreateEnum
CREATE TYPE "post_status" AS ENUM ('DRAFT', 'PUBLISHED');

-- DropIndex
DROP INDEX "post_slug_idx";

-- DropIndex
DROP INDEX "post_title_key";

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "cover_image" TEXT,
ADD COLUMN     "published_at" TIMESTAMP(3),
ADD COLUMN     "series_id" UUID,
ADD COLUMN     "series_order" INTEGER,
ADD COLUMN     "status" "post_status" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "slug" SET NOT NULL,
ALTER COLUMN "slug" DROP DEFAULT;

-- Backfill (직접 추가한 구문, Prisma가 생성한 것이 아니다)
--
-- status의 기본값은 DRAFT다. 새 글은 초안으로 시작하는 게 맞지만, 위
-- ADD COLUMN은 기존 행에도 DRAFT를 넣는다. 그대로 두면 이미 공개돼 있던
-- 글 19개가 전부 숨겨진다. 마이그레이션 안에서 같이 되돌려 놓는다.
-- published_at은 기존 글에 없던 값이라 작성 시각으로 채운다.
UPDATE "post"
SET "status" = 'PUBLISHED',
    "published_at" = "create_time"
WHERE "status" = 'DRAFT';

-- CreateTable
CREATE TABLE "series" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_slug_history" (
    "old_slug" TEXT NOT NULL,
    "post_id" UUID NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_slug_history_pkey" PRIMARY KEY ("old_slug")
);

-- CreateIndex
CREATE UNIQUE INDEX "series_slug_key" ON "series"("slug");

-- CreateIndex
CREATE INDEX "post_slug_history_post_id_idx" ON "post_slug_history"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_slug_key" ON "post"("slug");

-- CreateIndex
CREATE INDEX "post_status_published_at_idx" ON "post"("status", "published_at" DESC);

-- CreateIndex
CREATE INDEX "post_series_id_series_order_idx" ON "post"("series_id", "series_order");

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_slug_history" ADD CONSTRAINT "post_slug_history_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

