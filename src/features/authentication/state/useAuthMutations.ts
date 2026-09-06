import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuthStore } from '../../../core/auth/authStore';
import type { LoginPayload, RegisterPayload, ForgotPasswordPayload, ResetPasswordPayload } from '../models/auth';

/**
 * `mutation.error` is already a human-readable AppError (services/authService.ts
 * throws AppError directly; mapError() elsewhere is a pass-through for those) —
 * screens can render `mutation.error?.message` straight into an ErrorState.
 */

export function useLoginMutation() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => setSession(data.user, data.accessToken, data.refreshToken),
  });
}

export function useRegisterMutation() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => setSession(data.user, data.accessToken, data.refreshToken),
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authService.forgotPassword(payload),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
  });
}
