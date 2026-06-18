-- CreateTable
CREATE TABLE "FormOrganization" (
    "formId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "FormOrganization_formId_idx" ON "FormOrganization"("formId");

-- CreateIndex
CREATE INDEX "FormOrganization_organizationId_idx" ON "FormOrganization"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "FormOrganization_formId_organizationId_key" ON "FormOrganization"("formId", "organizationId");

-- AddForeignKey
ALTER TABLE "FormOrganization" ADD CONSTRAINT "FormOrganization_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormOrganization" ADD CONSTRAINT "FormOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
