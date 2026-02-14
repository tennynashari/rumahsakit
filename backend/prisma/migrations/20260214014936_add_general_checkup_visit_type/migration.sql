/*
  Warnings:

  - You are about to drop the column `queue_number` on the `visits` table. All the data in the column will be lost.
  - Made the column `visit_id` on table `medical_records` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "medical_records" DROP CONSTRAINT "medical_records_visit_id_fkey";

-- AlterTable
ALTER TABLE "medical_records" ALTER COLUMN "visit_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "visits" DROP COLUMN "queue_number";

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
