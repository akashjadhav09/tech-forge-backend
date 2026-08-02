import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

// Infer the validated type from the schema (same shape as SignInInput)
export type SignInSchema = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  full_name: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must be at most 100 characters"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid email address"),

  oldPassword: z
    .string()
    .min(1, "Old password is required")
    .min(8, "Old password must be at least 8 characters"),

  newPassword: z
    .string()
    .min(1, "New password is required")
    .min(8, "New password must be at least 8 characters"),
});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token is required"),
});

export type RefreshTokenSchema = z.infer<typeof refreshTokenSchema>;