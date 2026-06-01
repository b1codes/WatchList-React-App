import { createApi } from '@reduxjs/toolkit/query/react';
import { envelopeBaseQuery } from './baseQuery';
import type { CreateWatchListItemRequest, PagedResponse, WatchListItem } from '@/constants/types';

export const watchlistApi = createApi({
  reducerPath: 'watchlistApi',
  baseQuery: envelopeBaseQuery,
  tagTypes: ['Watchlist'],
  endpoints: (build) => ({
    getWatchlist: build.infiniteQuery<PagedResponse<WatchListItem>, number, string | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null,
      },
      query: ({ queryArg: pageSize, pageParam }) => {
        let url = `/api/watchlist?pageSize=${pageSize}`;
        if (pageParam) {
          const [seconds, nanos] = pageParam.split('.');
          if (seconds) url += `&lastAddedDateSeconds=${seconds}`;
          if (nanos) url += `&lastAddedDateNanos=${nanos}`;
        }
        return url;
      },
      providesTags: ['Watchlist'],
    }),
    addToWatchlist: build.mutation<string, CreateWatchListItemRequest>({
      query: (item) => ({
        url: '/api/watchlist',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: item,
      }),
      invalidatesTags: ['Watchlist'],
    }),
    removeFromWatchlist: build.mutation<string, number>({
      query: (tmdbId) => ({
        url: `/api/watchlist/${tmdbId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Watchlist'],
    }),
  }),
});

export const {
  useGetWatchlistInfiniteQuery,
  useAddToWatchlistMutation,
  useRemoveFromWatchlistMutation,
} = watchlistApi;
