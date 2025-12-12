-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cookieAnalyticsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notificationEmailEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notificationInAppEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "preferredCountry" TEXT,
ADD COLUMN     "preferredTimezone" TEXT;
