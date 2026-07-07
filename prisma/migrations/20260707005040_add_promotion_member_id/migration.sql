-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "member_id" TEXT;

-- CreateIndex
CREATE INDEX "Invitation_member_id_idx" ON "Invitation"("member_id");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
