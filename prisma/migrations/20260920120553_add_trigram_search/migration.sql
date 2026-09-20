-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateIndex
CREATE INDEX "post_title_idx" ON "post" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "post_description_idx" ON "post" USING GIN ("description" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "post_contents_idx" ON "post" USING GIN ("contents" gin_trgm_ops);

