import { pool } from "../../config/db.ts";

import type { UserRow } from "./auth.types.ts";

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    `SELECT user_id, full_name, email, password, created_at, updated_at
       FROM users
      WHERE email = $1
      LIMIT 1`,
    [email]
  );

  return result.rows[0] ?? null;
}


export async function createUser(data: { email: string, password: string, fullName: string }): Promise<UserRow> {
  const result = await pool.query<UserRow>(
    `INSERT INTO users (full_name, email, password)
       VALUES ($1, $2, $3)
    RETURNING user_id, full_name, email, password, created_at, updated_at`,
    [data.fullName, data.email, data.password]
  );

  const user = result.rows[0];
  if (!user) throw new Error("Insert succeeded but returned no row");
  return user;
}

export async function updateUserPassword(data: { userId: string, password: string }): Promise<void> {
  const result = await pool.query(
    `UPDATE users
        SET password   = $2,
            updated_at = NOW()
      WHERE user_id = $1`,
    [data.userId, data.password]
  );

  if ((result.rowCount ?? 0) === 0) {
    throw new Error(`No user found with id ${data.userId}`);
  }
}

export async function findUserById(userId: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    `SELECT user_id, full_name, email, password, created_at, updated_at
       FROM users
      WHERE user_id = $1
      LIMIT 1`,
    [userId]
  );

  return result.rows[0] ?? null;
}