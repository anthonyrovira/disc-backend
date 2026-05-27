/*
  Warnings:

  - Added the required column `dimension` to the `Option` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Option" (
    "value" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Option" ("content", "questionId", "value") SELECT "content", "questionId", "value" FROM "Option";
DROP TABLE "Option";
ALTER TABLE "new_Option" RENAME TO "Option";
CREATE UNIQUE INDEX "Option_value_key" ON "Option"("value");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
