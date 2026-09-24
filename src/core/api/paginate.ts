import { apiClient } from './client';
import type { ApiSuccess } from './envelope';

interface Paginated<T> extends ApiSuccess<T[]> {
  pagination: { page: number; totalPages: number };
}

/** Backend list endpoints are paginated (default 20, max 100). This walks every page. */
export async function fetchAllPages<T>(path: string, params: Record<string, unknown> = {}): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const { data } = await apiClient.get<Paginated<T>>(path, { params: { ...params, page, limit: 100 } });
    items.push(...data.data);
    totalPages = data.pagination.totalPages;
    page += 1;
  } while (page <= totalPages);
  return items;
}
