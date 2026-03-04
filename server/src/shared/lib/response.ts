export type ApiResponse<T = null> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

export const ok = <T>(data: T): ApiResponse<T> => ({ success: true, data });

export const fail = (error: string, details?: unknown): ApiResponse<null> => ({
  success: false,
  error,
  details,
});
