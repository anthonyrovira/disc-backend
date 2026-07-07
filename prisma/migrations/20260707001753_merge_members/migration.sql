/*
  Warnings:

  - You are about to drop the column `participantId` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the `OrganizationMembership` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Participant` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrganizationRole" ADD VALUE 'EMPLOYEE';
ALTER TYPE "OrganizationRole" ADD VALUE 'CANDIDATE';

-- DropForeignKey
ALTER TABLE "Form" DROP CONSTRAINT "Form_participantId_fkey";

-- DropForeignKey
ALTER TABLE "Form" DROP CONSTRAINT "Form_user_id_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMembership" DROP CONSTRAINT "OrganizationMembership_invitedById_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMembership" DROP CONSTRAINT "OrganizationMembership_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMembership" DROP CONSTRAINT "OrganizationMembership_teamId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMembership" DROP CONSTRAINT "OrganizationMembership_userId_fkey";

-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_invitedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_teamId_fkey";

-- DropIndex
DROP INDEX "Form_participantId_idx";

-- DropIndex
DROP INDEX "Form_user_id_idx";

-- AlterTable
ALTER TABLE "Form" DROP COLUMN "participantId",
DROP COLUMN "user_id",
ADD COLUMN     "memberId" TEXT;

-- DropTable
DROP TABLE "OrganizationMembership";

-- DropTable
DROP TABLE "Participant";

-- DropEnum
DROP TYPE "ParticipantStatus";

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "role" "OrganizationRole" NOT NULL,
    "teamId" TEXT,
    "invitedById" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationMember_teamId_idx" ON "OrganizationMember"("teamId");

-- CreateIndex
CREATE INDEX "OrganizationMember_email_idx" ON "OrganizationMember"("email");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_email_key" ON "OrganizationMember"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_userId_organizationId_key" ON "OrganizationMember"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "Form_memberId_idx" ON "Form"("memberId");

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
