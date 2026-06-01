import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { auth } from '@/config/firebase';
import { API_BASE_URL } from '@/api/client';
import type { ApiResponse } from '@/constants/types';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers) => {
    const token = await auth.currentUser?.getIdToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const envelopeBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =
  async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);
    if (result.error) return result;
    const body = result.data as ApiResponse<unknown>;
    if (!body?.success) {
      return {
        error: {
          status: 'CUSTOM_ERROR' as const,
          error: body?.error ?? 'Request failed.',
          data: body,
        },
      };
    }
    return { data: body.data };
  };
