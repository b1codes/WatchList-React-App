import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type WatchlistFilter = 'all' | 'movie' | 'tv';

type UiState = {
  watchlistFilter: WatchlistFilter;
  searchDebouncedQuery: string;
};

const initialState: UiState = {
  watchlistFilter: 'all',
  searchDebouncedQuery: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setWatchlistFilter(state, action: PayloadAction<WatchlistFilter>) {
      state.watchlistFilter = action.payload;
    },
    setSearchDebouncedQuery(state, action: PayloadAction<string>) {
      state.searchDebouncedQuery = action.payload;
    },
  },
});

export const { setWatchlistFilter, setSearchDebouncedQuery } = uiSlice.actions;
export default uiSlice.reducer;
