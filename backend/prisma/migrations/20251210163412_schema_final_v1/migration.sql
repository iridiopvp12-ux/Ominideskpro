-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_contactId_fkey";

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "closingNote" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'AGENT';

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
