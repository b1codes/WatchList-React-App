import { createApi } from '@reduxjs/toolkit/query/react';
import { envelopeBaseQuery } from './baseQuery';
import type { MediaDto, MovieDetailsResponse, PagedResponse, TmdbConfiguration } from '@/constants/types';

export const tmdbApi = createApi({
  reducerPath: 'tmdbApi',
  baseQuery: envelopeBaseQuery,
  endpoints: (build) => ({
    getMovieConfig: build.query<TmdbConfiguration | null, void>({
      query: () => '/api/movies/config',
    }),
    getTrendingMovies: build.query<PagedResponse<MediaDto> | null, void>({
      query: () => '/api/movies/trending',
    }),
    discoverMovies: build.query<PagedResponse<MediaDto> | null, number>({
      query: (page) => `/api/movies/discover?page=${page}`,
    }),
    getMovieDetails: build.query<MovieDetailsResponse | null, { id: number; type: string }>({
      query: ({ id, type }) => `/api/movies/details/${id}?type=${type}`,
    }),
    getSimilarMovies: build.query<PagedResponse<MediaDto> | null, { id: number; page: number; type: string }>({
      query: ({ id, page, type }) => `/api/movies/similar/${id}?page=${page}&type=${type}`,
    }),
    getRecommendedMovies: build.query<PagedResponse<MediaDto> | null, { id: number; page: number; type: string }>({
      query: ({ id, page, type }) => `/api/movies/recommendations/${id}?page=${page}&type=${type}`,
    }),
    searchMovies: build.infiniteQuery<PagedResponse<MediaDto> | null, string, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
          if (!lastPage?.nextCursor) return undefined;
          return parseInt(lastPage.nextCursor, 10);
        },
      },
      query: ({ queryArg: searchQuery, pageParam }) =>
        `/api/movies/search?query=${encodeURIComponent(searchQuery)}&page=${pageParam}`,
    }),
  }),
});

export const {
  useGetMovieConfigQuery,
  useGetTrendingMoviesQuery,
  useDiscoverMoviesQuery,
  useGetMovieDetailsQuery,
  useGetSimilarMoviesQuery,
  useGetRecommendedMoviesQuery,
  useSearchMoviesInfiniteQuery,
} = tmdbApi;
