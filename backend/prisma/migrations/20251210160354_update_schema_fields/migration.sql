/*
  Warnings:

  - You are about to drop the column `businessName` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `mediaUrl` on the `Message` table. All the data in the column will be lost.
  - The primary key for the `Ticket` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "businessName",
DROP COLUMN "email",
DROP COLUMN "notes",
DROP COLUMN "tags",
ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "mediaUrl";

-- AlterTable
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_pkey",
ADD COLUMN     "summary" JSONB,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "status" SET DEFAULT 'todo',
ALTER COLUMN "priority" SET DEFAULT 'medium',
ADD CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Ticket_id_seq";
