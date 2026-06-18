-- Map existing EXTERNAL records to REFERRAL (closest semantic match)
UPDATE "Invitation" SET "type" = 'REFERRAL' WHERE "type" = 'EXTERNAL';

-- Remove EXTERNAL from enum
ALTER TYPE "InvitationType" RENAME TO "InvitationType_old";
CREATE TYPE "InvitationType" AS ENUM ('TEAM_MEMBER', 'REFERRAL');
ALTER TABLE "Invitation" ALTER COLUMN "type" TYPE "InvitationType" USING "type"::text::"InvitationType";
DROP TYPE "InvitationType_old";
