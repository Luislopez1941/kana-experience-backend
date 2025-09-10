/*
  Warnings:

  - Added the required column `folioId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "folioId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Folio" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "folio" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Folio_folio_key" ON "Folio"("folio");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_folioId_fkey" FOREIGN KEY ("folioId") REFERENCES "Folio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
