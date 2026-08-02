import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.ts";

import { AppError } from "../../middlewares/error.middleware.ts";
import { findUserByEmail, createUser, updateUserPassword, findUserById } from "./auth.repository.ts";
import type { SignInInput, AuthTokens, SignUpInput, ResetPasswordInput, RefreshTokenInput } from "./auth.types.ts";

/**
 * Validates credentials and returns a pair of JWT tokens.
 *
 * Throws `AppError(401)` for any invalid-credential case — deliberately using
 * a single generic message to avoid leaking whether the email exists.
 */
export async function signIn(data: SignInInput): Promise<AuthTokens> {
  const user = await findUserByEmail(data.email);

  // Use a constant-time comparison even when user is null to prevent
  // timing-based user enumeration attacks.
  const DUMMY_HASH = "$2b$10$invalidhashfortimingreasonsonlyXXXXXXXXXXXXXXXXXXXX";

  const passwordToCheck = user?.password ?? DUMMY_HASH;
  const isPasswordValid = await bcrypt.compare(data.password, passwordToCheck);

  if (!user || !isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken(user.user_id);
  const refreshToken = generateRefreshToken(user.user_id);

  return { accessToken, refreshToken };
}

export async function signUp(data: SignUpInput): Promise<AuthTokens> {
  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    throw new AppError(409, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await createUser({
    email: data.email,
    password: hashedPassword,
    fullName: data.full_name,
  });

  const accessToken = generateAccessToken(user.user_id);
  const refreshToken = generateRefreshToken(user.user_id);

  return { accessToken, refreshToken };
}

export async function resetPassword(data: ResetPasswordInput): Promise<void> {
  const user = await findUserByEmail(data.email);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(data.oldPassword, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, "Invalid old password");
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 12);

  await updateUserPassword({
    userId: user.user_id,
    password: hashedPassword,
  });
}

export async function refreshToken(data: RefreshTokenInput): Promise<AuthTokens> {
  let userId: string;

  try {
    const payload = verifyRefreshToken(data.refreshToken);
    userId = payload.userId;
  } catch {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(401, "User no longer exists");
  }

  const accessToken = generateAccessToken(user.user_id);
  const newRefreshToken = generateRefreshToken(user.user_id);

  return { accessToken, refreshToken: newRefreshToken };
}
