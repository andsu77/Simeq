ALTER TABLE "usuarios"
ADD COLUMN "tutorialStatus" TEXT NOT NULL DEFAULT 'PENDING';

ALTER TABLE "usuarios"
ADD COLUMN "tutorialStartedAt" DATETIME;

ALTER TABLE "usuarios"
ADD COLUMN "tutorialCompletedAt" DATETIME;
