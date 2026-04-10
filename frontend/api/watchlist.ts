import { requestApi } from '@/api/client';
import { CreateWatchListItemRequest, WatchListItem } from '@/constants/types';
import { auth } from '@/config/firebase';

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await auth.currentUser?.getIdToken();
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
};

export const getWatchlist = async () => {
  const headers = await getAuthHeaders();
  return requestApi<WatchListItem[]>('/api/watchlist', { headers });
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
