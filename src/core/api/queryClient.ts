import { QueryClient } from '@tanstack/react-query';
import { mapError } from '../errors/errorMapper';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      // Errors are already normalized to AppError by the axios interceptor,
      // but services that don't go through apiClient (mocks) may throw raw
      // errors — normalize once more here so screens can always trust
      // error.message to be human-readable Arabic/English text.
      throwOnError: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export { mapError };
