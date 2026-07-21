import { pool } from "../../config/db.ts";

import type { LikeRow } from "./like.types.ts";

/**
 * Inserts a like for a blog by a user.
 * Returns null if the user has already liked the blog (unique constraint violation).
 */
export async function createLike(
    blogId: string,
    userId: string
): Promise<LikeRow | null> {
    try {
        const result = await pool.query<LikeRow>(
            `INSERT INTO likes (blog_id, user_id)
             VALUES ($1, $2)
             RETURNING like_id, blog_id, user_id, created_at`,
            [blogId, userId]
        );

        return result.rows[0] ?? null;
    } catch (err: unknown) {
        // Postgres unique_violation = code 23505 (unique_blog_like constraint)
        if (
            typeof err === "object" &&
            err !== null &&
            "code" in err &&
            (err as { code: string }).code === "23505"
        ) {
            return null; // Already liked — caller handles this case
        }
        throw err;
    }
}

/**
 * Removes a like for a blog by a user.
 * Returns true if a row was deleted, false if the like did not exist.
 */
export async function deleteLike(blogId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
        `DELETE FROM likes WHERE blog_id = $1 AND user_id = $2`,
        [blogId, userId]
    );

    return (result.rowCount ?? 0) > 0;
}

/**
 * Returns the total number of likes for a blog.
 */
export async function getLikeCountByBlogId(blogId: string): Promise<number> {
    const result = await pool.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM likes WHERE blog_id = $1`,
        [blogId]
    );

    return parseInt(result.rows[0]?.count ?? "0", 10);
}

/**
 * Checks whether a specific user has already liked a blog.
 */
export async function findLikeByBlogAndUser(
    blogId: string,
    userId: string
): Promise<LikeRow | null> {
    const result = await pool.query<LikeRow>(
        `SELECT like_id, blog_id, user_id, created_at
           FROM likes
          WHERE blog_id = $1 AND user_id = $2
          LIMIT 1`,
        [blogId, userId]
    );

    return result.rows[0] ?? null;
}
