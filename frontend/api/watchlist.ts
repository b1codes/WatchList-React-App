import { requestApi } from '@/api/client';
import { CreateWatchListItemRequest, PagedResponse, WatchListItem } from '@/constants/types';
import { auth } from '@/config/firebase';

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await auth.currentUser?.getIdToken();
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
};

export const getWatchlist = async (pageSize = 20, cursor?: string) => {
  const headers = await getAuthHeaders();
  let url = `/api/watchlist?pageSize=${pageSize}`;
  if (cursor) {
    const [seconds, nanos] = cursor.split('.');
    if (seconds) url += `&lastAddedDateSeconds=${seconds}`;
    if (nanos) url += `&lastAddedDateNanos=${nanos}`;
  }
  return requestApi<PagedResponse<WatchListItem>>(url, { headers });
};

export const addToWatchlist = async (item: CreateWatchListItemRequest) => {
  const headers = await getAuthHeaders();
  return requestApi<string>('/api/watchlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(item),
  });
};

export const removeFromWatchlist = async (tmdbId: number) => {
  const headers = await getAuthHeaders();
  return requestApi<string>(`/api/watchlist/${tmdbId}`, {
    method: 'DELETE',
    headers,
  });
};
