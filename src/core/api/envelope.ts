/**
 * Every backend response is wrapped as `{ success: true, data }` on success
 * or `{ success: false, error: { code, message, details? } }` on failure.
 * `apiClient` callers unwrap with `unwrap()` rather than reading `.data.data`.
 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export function unwrap<T>(response: { data: ApiSuccess<T> }): T {
  return response.data.data;
}
