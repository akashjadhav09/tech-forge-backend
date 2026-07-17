// ── Request / Input Types ─────────────────────────────────────────────────────

export interface SignInInput {
  email: string;
  password: string;
}

// ── Database Row Types ────────────────────────────────────────────────────────

export interface UserRow {
  user_id: string;
  full_name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

// ── Response Types ────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
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