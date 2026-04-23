import { requestApi } from '@/api/client';
import {
  MediaDto,
  MovieDetailsResponse,
  PagedResponse,
  TmdbConfiguration,
} from '@/constants/types';

export const fetchMovieConfig = () => requestApi<TmdbConfiguration | null>('/api/movies/config');

export const searchMovies = (query: string, page = 1) =>
  requestApi<PagedResponse<MediaDto> | null>(
    `/api/movies/search?query=${encodeURIComponent(query)}&page=${page}`,
  );

export const getTrendingMovies = () =>
  requestApi<PagedResponse<MediaDto> | null>('/api/movies/trending');

export const discoverMovies = (page = 1) =>
  requestApi<PagedResponse<MediaDto> | null>(`/api/movies/discover?page=${page}`);

export const getMovieDetails = (id: number, type: string = 'movie') =>
  requestApi<MovieDetailsResponse | null>(`/api/movies/details/${id}?type=${type}`);

export const getSimilarMovies = (id: number, page = 1, type: string = 'movie') =>
  requestApi<PagedResponse<MediaDto> | null>(`/api/movies/similar/${id}?page=${page}&type=${type}`);

export const getRecommendedMovies = (id: number, page = 1, type: string = 'movie') =>
  requestApi<PagedResponse<MediaDto> | null>(`/api/movies/recommendations/${id}?page=${page}&type=${type}`);
