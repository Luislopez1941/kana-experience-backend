/*
  Warnings:

  - You are about to drop the column `image` on the `TourCategory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TourCategory" DROP COLUMN "image";

-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "reservationDate" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "description" TEXT,
    "productId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "qr" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" INTEGER NOT NULL,
    "yachtId" INTEGER,
    "tourId" INTEGER,
    "clubId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_yachtId_fkey" FOREIGN KEY ("yachtId") REFERENCES "Yacht"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;
