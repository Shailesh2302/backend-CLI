export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export function success<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, message };
}

export function error(message: string): ApiResponse {
  return { success: false, error: message };
}
