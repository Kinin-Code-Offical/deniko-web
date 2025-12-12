-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allowMessagesFromUsers" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isProfilePublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showAvatarOnProfile" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showEmailOnProfile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showPhoneOnProfile" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "username" DROP NOT NULL;
