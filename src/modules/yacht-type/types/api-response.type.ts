// Tipo de respuesta personalizado para la API
export interface ApiResponse<T> {
  data: T;
  status: string;
  message: string;
} 