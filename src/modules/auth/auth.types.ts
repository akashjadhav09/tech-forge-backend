// ── Request / Input Types ─────────────────────────────────────────────────────

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  full_name: string;
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

// ── Database Row Types ────────────────────────────────────────────────────────

export interface UserRow {
  user_id: string;
  full_name: string;
  email: string;
  password: string;
  bio: string;
  profile_image: string; // column name in DB: profile_image
  created_at: Date;
  updated_at: Date;
}

// ── Response Types ────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Safe user profile shape returned to the client.
 * Never includes password.
 */
export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  bio: string;
  profileImage: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Allowed fields for PUT /users/me.
 * All fields are optional — only provided ones are updated.
 */
export interface UpdateProfileInput {
  fullName?: string;
  email?: string;
  bio?: string;
}