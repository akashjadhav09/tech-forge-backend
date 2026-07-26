import { pool } from "../../config/db.ts";

import type { DislikeRow } from "./dislike.types.ts";

/**
 * Inserts a dislike for a blog by a user.
 * Returns null if the user has already disliked the blog (unique constraint violation).
 */
export async function createDislike(
    blogId: string,
    userId: string
): Promise<DislikeRow | null> {
    try {
        const result = await pool.query<DislikeRow>(
            `INSERT INTO dislikes (blog_id, user_id)
             VALUES ($1, $2)
             RETURNING dislike_id, blog_id, user_id, created_at`,
            [blogId, userId]
        );

        return result.rows[0] ?? null;
    } catch (err: unknown) {
        // Postgres unique_violation = code 23505 (unique_blog_dislike constraint)
        if (
            typeof err === "object" &&
            err !== null &&
            "code" in err &&
            (err as { code: string }).code === "23505"
        ) {
            return null; // Already disliked — caller handles this case
        }
        throw err;
    }
}

/**
 * Removes a dislike for a blog by a user.
 * Returns true if a row was deleted, false if the dislike did not exist.
 */
export async function deleteDislike(blogId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
        `DELETE FROM dislikes WHERE blog_id = $1 AND user_id = $2`,
        [blogId, userId]
    );

    return (result.rowCount ?? 0) > 0;
}

/**
 * Returns the total number of dislikes for a blog.
 */
export async function getDislikeCountByBlogId(blogId: string): Promise<number> {
    const result = await pool.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM dislikes WHERE blog_id = $1`,
        [blogId]
    );

    return parseInt(result.rows[0]?.count ?? "0", 10);
}

/**
 * Checks whether a specific user has already disliked a blog.
 */
export async function findDislikeByBlogAndUser(
    blogId: string,
    userId: string
): Promise<DislikeRow | null> {
    const result = await pool.query<DislikeRow>(
        `SELECT dislike_id, blog_id, user_id, created_at
           FROM dislikes
          WHERE blog_id = $1 AND user_id = $2
          LIMIT 1`,
        [blogId, userId]
    );

    return result.rows[0] ?? null;
}
