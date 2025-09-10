export class Reservation {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  reservationDate: Date;
  quantity: number;
  description?: string | null;
  productId: number;
  type: string;
  qr?: string | null;
  status: string;
  folioId: number;
  userId: number;
  yachtId?: number | null;
  tourId?: number | null;
  clubId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}