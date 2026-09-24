import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import { useAuthStore } from '../../../core/auth/authStore';
import { syncOnboardingAnswers } from '../../onboarding/services/onboardingService';
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
    onSuccess: async (data) => {
      await setSession(data.user, data.accessToken, data.refreshToken);
      // Best-effort: push the onboarding answers collected before login.
      void syncOnboardingAnswers().catch(() => {});
    },
  });
}

export function useRegisterMutation() {
  const { i18n } = useTranslation();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    // The account's language is the app's language at sign-up; the service
    // no longer reads it from a global.
    mutationFn: (payload: RegisterPayload) =>
      authService.register({ ...payload, language: i18n.language === 'en' ? 'en' : 'ar' }),
    onSuccess: async (data) => {
      await setSession(data.user, data.accessToken, data.refreshToken);
      // Best-effort: push the onboarding answers collected before login.
      void syncOnboardingAnswers().catch(() => {});
    },
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
