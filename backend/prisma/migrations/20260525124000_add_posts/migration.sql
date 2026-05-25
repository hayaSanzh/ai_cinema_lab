CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "youtube_url" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "post_likes" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT,
    "anonymous_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "post_comments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");
CREATE INDEX "post_likes_post_id_idx" ON "post_likes"("post_id");
CREATE INDEX "post_likes_user_id_idx" ON "post_likes"("user_id");
CREATE INDEX "post_likes_anonymous_id_idx" ON "post_likes"("anonymous_id");
CREATE UNIQUE INDEX "post_likes_post_user_unique" ON "post_likes"("post_id", "user_id") WHERE "user_id" IS NOT NULL;
CREATE UNIQUE INDEX "post_likes_post_anonymous_unique" ON "post_likes"("post_id", "anonymous_id") WHERE "anonymous_id" IS NOT NULL;
CREATE INDEX "post_comments_post_id_idx" ON "post_comments"("post_id");
CREATE INDEX "post_comments_user_id_idx" ON "post_comments"("user_id");

ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_identity_check" CHECK ("user_id" IS NOT NULL OR "anonymous_id" IS NOT NULL);
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5);

INSERT INTO "posts" ("id", "slug", "title", "youtube_url", "description")
VALUES (
    'f2f49580-e26d-45d1-8a09-258045bdf225',
    'documentary-film',
    'Documentary Film',
    'https://www.youtube.com/watch?v=aircAruvnKk',
    'A featured film post for discussing how AI changes perception, authorship, and cinema.'
)
ON CONFLICT ("slug") DO NOTHING;
