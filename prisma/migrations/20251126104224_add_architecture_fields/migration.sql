/*
  Warnings:

  - You are about to drop the column `diagram` on the `Architecture` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Mockup" ADD COLUMN "code" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Architecture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "highLevel" TEXT,
    "lowLevel" TEXT,
    "functionalDecomposition" TEXT,
    "systemDiagram" TEXT,
    "erDiagram" TEXT,
    "sequenceDiagrams" TEXT,
    "dataFlowDiagram" TEXT,
    "deploymentDiagram" TEXT,
    "componentDiagram" TEXT,
    "databaseSchema" TEXT,
    "apiSpec" TEXT,
    "techStack" TEXT,
    "securityDesign" TEXT,
    "scalingStrategy" TEXT,
    "embedding" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Architecture_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Architecture" ("content", "createdAt", "embedding", "id", "projectId", "updatedAt") SELECT "content", "createdAt", "embedding", "id", "projectId", "updatedAt" FROM "Architecture";
DROP TABLE "Architecture";
ALTER TABLE "new_Architecture" RENAME TO "Architecture";
CREATE UNIQUE INDEX "Architecture_projectId_key" ON "Architecture"("projectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
