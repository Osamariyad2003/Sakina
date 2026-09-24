import { z } from 'zod';
import { UserSchema } from '../../../types/models';

export const LoginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginPayload = z.infer<typeof LoginPayloadSchema>;

export const RegisterPayloadSchema = z.object({
  displayName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  /** The app's language at sign-up, supplied by the caller (the service does not read i18n). */
  language: z.enum(['ar', 'en']).optional(),
});
export type RegisterPayload = z.infer<typeof RegisterPayloadSchema>;

export const ForgotPasswordPayloadSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordPayload = z.infer<typeof ForgotPasswordPayloadSchema>;

export const ResetPasswordPayloadSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});
export type ResetPasswordPayload = z.infer<typeof ResetPasswordPayloadSchema>;

export const AuthResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
