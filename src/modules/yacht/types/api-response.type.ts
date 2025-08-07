// Tipo de respuesta personalizado para la API
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  data: T;
  status: string;
  message: string;
  pagination?: PaginationInfo;
} 