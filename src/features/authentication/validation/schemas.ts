import { z } from 'zod';
import type { TFunction } from 'i18next';

/**
 * Form-level validation (distinct from the domain payload schemas in
 * models/auth.ts) — these carry the user-facing Arabic/English messages
 * (spec §28). Built as factories so messages follow the active language
 * (RTL/LTR both need to be tested per spec §38).
 */

export function buildLoginSchema(t: TFunction) {
  return z.object({
    email: z.string().min(1, t('auth.validation.emailRequired')).email(t('errors.invalidEmail')),
    password: z.string().min(1, t('auth.validation.passwordRequired')),
  });
}
export type LoginFormValues = z.infer<ReturnType<typeof buildLoginSchema>>;

export function buildRegisterSchema(t: TFunction) {
  return z
    .object({
      displayName: z.string().min(1, t('auth.validation.nameRequired')),
      email: z.string().min(1, t('auth.validation.emailRequired')).email(t('errors.invalidEmail')),
      password: z.string().min(8, t('auth.validation.passwordTooShort')),
      confirmPassword: z.string().min(1, t('auth.validation.passwordRequired')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.validation.passwordsDontMatch'),
      path: ['confirmPassword'],
    });
}
export type RegisterFormValues = z.infer<ReturnType<typeof buildRegisterSchema>>;

export function buildForgotPasswordSchema(t: TFunction) {
  return z.object({
    email: z.string().min(1, t('auth.validation.emailRequired')).email(t('errors.invalidEmail')),
  });
}
export type ForgotPasswordFormValues = z.infer<ReturnType<typeof buildForgotPasswordSchema>>;

export function buildResetPasswordSchema(t: TFunction) {
  return z
    .object({
      newPassword: z.string().min(8, t('auth.validation.passwordTooShort')),
      confirmPassword: z.string().min(1, t('auth.validation.passwordRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('auth.validation.passwordsDontMatch'),
      path: ['confirmPassword'],
    });
}
export type ResetPasswordFormValues = z.infer<ReturnType<typeof buildResetPasswordSchema>>;
