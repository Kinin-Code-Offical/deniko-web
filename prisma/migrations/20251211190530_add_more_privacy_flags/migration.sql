-- AlterTable
ALTER TABLE "User" ADD COLUMN     "showAchievementsOnProfile" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showCoursesOnProfile" BOOLEAN NOT NULL DEFAULT true;
