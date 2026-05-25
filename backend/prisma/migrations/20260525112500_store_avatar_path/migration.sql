ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar_data_url";
ALTER TABLE "users" ADD COLUMN "avatar_path" TEXT;
