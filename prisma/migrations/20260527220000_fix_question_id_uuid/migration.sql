-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Answer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "optionValue" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Answer_optionValue_fkey" FOREIGN KEY ("optionValue") REFERENCES "Option" ("value") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Answer_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Answer" ("form_id", "id", "optionValue", "question_id", "updated_at") SELECT "form_id", "id", "optionValue", "question_id", "updated_at" FROM "Answer";
DROP TABLE "Answer";
ALTER TABLE "new_Answer" RENAME TO "Answer";
CREATE UNIQUE INDEX "Answer_form_id_question_id_key" ON "Answer"("form_id", "question_id");
CREATE TABLE "new_FormQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "answered" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "FormQuestion_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FormQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FormQuestion" ("answered", "formId", "id", "order", "questionId") SELECT "answered", "formId", "id", "order", "questionId" FROM "FormQuestion";
DROP TABLE "FormQuestion";
ALTER TABLE "new_FormQuestion" RENAME TO "FormQuestion";
CREATE UNIQUE INDEX "FormQuestion_formId_questionId_key" ON "FormQuestion"("formId", "questionId");
CREATE TABLE "new_Option" (
    "value" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Option" ("content", "dimension", "questionId", "value") SELECT "content", "dimension", "questionId", "value" FROM "Option";
DROP TABLE "Option";
ALTER TABLE "new_Option" RENAME TO "Option";
CREATE UNIQUE INDEX "Option_value_key" ON "Option"("value");
CREATE TABLE "new_Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL
);
INSERT INTO "new_Question" ("content", "id") SELECT "content", "id" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
