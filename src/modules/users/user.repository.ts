import { pool } from "../../config/db.ts";
import type { UserRow } from "../auth/auth.types.ts";

/**
 * Finds a user by their primary key (user_id).
 * Used after JWT auth to hydrate the current user's profile.
 * Returns null if no matching user exists.
 */
export async function findUserById(userId: string): Promise<UserRow | null> {
    console.log("User findUserById");

    const result = await pool.query<UserRow>(
        `SELECT user_id, full_name, email, bio, profile_image, created_at, updated_at
           FROM users
          WHERE user_id = $1
          LIMIT 1`,
        [userId]
    );

    return result.rows[0] ?? null;
}

/**
 * Partially updates a user's text profile fields (fullName, email, bio).
 * Only non-null values are applied; COALESCE preserves existing values.
 * Returns the updated row.
 */
export async function updateUserProfileDetails(data: {
    userId: string;
    fullName?: string;
    email?: string;
    bio?: string;
}): Promise<UserRow> {
    const result = await pool.query<UserRow>(
        `UPDATE users
            SET full_name  = COALESCE($2, full_name),
                email      = COALESCE($3, email),
                bio        = COALESCE($4, bio),
                updated_at = NOW()
          WHERE user_id = $1
      RETURNING user_id, full_name, email, bio, profile_image, created_at, updated_at`,
        [data.userId, data.fullName ?? null, data.email ?? null, data.bio ?? null]
    );

    if ((result.rowCount ?? 0) === 0) {
        throw new Error(`No user found with id ${data.userId}`);
    }

    return result.rows[0]!;
}

/**
 * Updates only the profile_image column for a user.
 * Returns the updated row.
 */
export async function updateUserAvatar(userId: string, profileImage: string): Promise<UserRow> {
    const result = await pool.query<UserRow>(
        `UPDATE users
            SET profile_image = $2,
                updated_at    = NOW()
          WHERE user_id = $1
      RETURNING user_id, full_name, email, bio, profile_image, created_at, updated_at`,
        [userId, profileImage]
    );

    if ((result.rowCount ?? 0) === 0) {
        throw new Error(`No user found with id ${userId}`);
    }

    return result.rows[0]!;
}

/**
 * Hard-deletes a user record by user_id.
 * Throws if no row was deleted.
 */
export async function deleteUserById(userId: string): Promise<void> {
    const result = await pool.query(
        `DELETE FROM users WHERE user_id = $1`,
        [userId]
    );

    if ((result.rowCount ?? 0) === 0) {
        throw new Error(`No user found with id ${userId}`);
    }
}
