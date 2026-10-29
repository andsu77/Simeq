ALTER TABLE "usuarios"
ADD COLUMN "preferencesJson" TEXT NOT NULL DEFAULT '{}';

ALTER TABLE "usuarios"
ADD COLUMN "iotEnabled" BOOLEAN NOT NULL DEFAULT false;
