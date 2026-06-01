import { configureStore } from '@reduxjs/toolkit';
import { tmdbApi } from './api/tmdbApi';
import { watchlistApi } from './api/watchlistApi';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [tmdbApi.reducerPath]: tmdbApi.reducer,
    [watchlistApi.reducerPath]: watchlistApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(tmdbApi.middleware)
      .concat(watchlistApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
