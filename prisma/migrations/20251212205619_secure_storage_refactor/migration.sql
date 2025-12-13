/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `HomeworkSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `HomeworkTracking` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `tempAvatar` on the `StudentProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HomeworkSubmission" DROP COLUMN "fileUrl",
ADD COLUMN     "fileId" TEXT;

-- AlterTable
ALTER TABLE "HomeworkTracking" DROP COLUMN "fileUrl",
ADD COLUMN     "fileId" TEXT;

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "url",
ADD COLUMN     "fileId" TEXT,
ADD COLUMN     "linkUrl" TEXT;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "fileName",
DROP COLUMN "fileType",
DROP COLUMN "fileUrl",
ADD COLUMN     "fileId" TEXT;

-- AlterTable
ALTER TABLE "StudentProfile" DROP COLUMN "tempAvatar",
ADD COLUMN     "tempAvatarKey" TEXT;

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkTracking" ADD CONSTRAINT "HomeworkTracking_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmission" ADD CONSTRAINT "HomeworkSubmission_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
