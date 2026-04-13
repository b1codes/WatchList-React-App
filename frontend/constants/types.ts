export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string | null;
};

export type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
};

export type WatchListItem = {
  id?: string | null;
  userId: string;
  tmdbId: number;
  title: string;
  type: string;
  posterPath?: string | null;
  releaseYear?: number | null;
  addedDate?: FirestoreTimestamp | null;
};

export type CreateWatchListItemRequest = {
  tmdbId: number;
  title: string;
  type: string;
  posterPath?: string | null;
  releaseYear?: number | null;
};

export type TmdbImageConfiguration = {
  base_url?: string | null;
  secure_base_url?: string | null;
  backdrop_sizes?: string[];
  logo_sizes?: string[];
  poster_sizes?: string[];
  profile_sizes?: string[];
  still_sizes?: string[];
};

export type TmdbConfiguration = {
  images?: TmdbImageConfiguration | null;
  change_keys?: string[];
};

export type TmdbPagedResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

export type TmdbSearchResult = {
  id: number;
  media_type?: string | null;
  title?: string | null;
  name?: string | null;
  poster_path?: string | null;
  profile_path?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  known_for_department?: string | null;
};

export type TmdbGenre = {
  id: number;
  name?: string | null;
};

export type TmdbCastMember = {
  id: number;
  name?: string | null;
  character?: string | null;
  profile_path?: string | null;
  order: number;
};

export type TmdbCrewMember = {
  id: number;
  name?: string | null;
  job?: string | null;
  department?: string | null;
};

export type TmdbCredits = {
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
};

export type TmdbVideo = {
  id?: string | null;
  name?: string | null;
  site?: string | null;
  key?: string | null;
  type?: string | null;
};

export type TmdbVideoGroup = {
  results: TmdbVideo[];
};

export type TmdbMovieDetails = {
  id: number;
  title?: string | null;
  name?: string | null;
  overview?: string | null;
  tagline?: string | null;
  poster_path?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  runtime?: number | null;
  episode_run_time?: number[] | null;
  number_of_seasons?: number | null;
  number_of_episodes?: number | null;
  genres: TmdbGenre[];
  credits?: TmdbCredits | null;
  videos?: TmdbVideoGroup | null;
};

export type TmdbWatchProvider = {
  provider_id: number;
  provider_name?: string | null;
  logo_path?: string | null;
  display_priority: number;
};

export type TmdbWatchProviderRegion = {
  link?: string | null;
  flatrate: TmdbWatchProvider[];
  rent: TmdbWatchProvider[];
  buy: TmdbWatchProvider[];
};

export type TmdbWatchProvidersResponse = {
  id: number;
  results: Record<string, TmdbWatchProviderRegion>;
};

export type MovieDetailsResponse = {
  details?: TmdbMovieDetails | null;
  providers?: TmdbWatchProvidersResponse | null;
};
