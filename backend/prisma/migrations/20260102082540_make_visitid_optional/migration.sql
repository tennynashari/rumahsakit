-- DropForeignKey
ALTER TABLE "medical_records" DROP CONSTRAINT "medical_records_visit_id_fkey";

-- AlterTable
ALTER TABLE "medical_records" ALTER COLUMN "visit_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
