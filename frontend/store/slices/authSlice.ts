import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SerializableUser = {
  uid: string;
  email: string | null;
};

type AuthState = {
  user: SerializableUser | null;
  loading: boolean;
};

const initialState: AuthState = {
  user: null,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<SerializableUser>) {
      state.user = action.payload;
      state.loading = false;
    },
    clearUser(state) {
      state.user = null;
      state.loading = false;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
