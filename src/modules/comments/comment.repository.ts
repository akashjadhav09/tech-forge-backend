import { pool } from "../../config/db.ts";

import type { CommentRow, CommentWithAuthorRow } from "./comment.types.ts";

/**
 * Inserts a new comment into the database.
 * Returns the comment joined with the author's name.
 */
export async function createComment(data: {
    blogId: string;
    userId: string;
    content: string;
}): Promise<CommentWithAuthorRow> {
    const result = await pool.query<CommentWithAuthorRow>(
        `INSERT INTO comments (blog_id, user_id, comment)
         VALUES ($1, $2, $3)
         RETURNING
             comment_id, blog_id, user_id, comment, created_at, updated_at,
             (SELECT full_name FROM users WHERE user_id = $2) AS author_name`,
        [data.blogId, data.userId, data.content]
    );

    const comment = result.rows[0];
    if (!comment) throw new Error("Insert succeeded but returned no row");
    return comment;
}

/**
 * Finds a single comment by its primary key.
 */
export async function findCommentById(commentId: string): Promise<CommentRow | null> {
    const result = await pool.query<CommentRow>(
        `SELECT comment_id, blog_id, user_id, comment, created_at, updated_at
           FROM comments
          WHERE comment_id = $1
          LIMIT 1`,
        [commentId]
    );

    return result.rows[0] ?? null;
}

/**
 * Fetches all comments for a given blog, joined with author names.
 * Ordered by creation date ascending (oldest first).
 */
export async function findCommentsByBlogId(blogId: string): Promise<CommentWithAuthorRow[]> {
    const result = await pool.query<CommentWithAuthorRow>(
        `SELECT c.comment_id, c.blog_id, c.user_id, c.comment, c.created_at, c.updated_at,
                u.full_name AS author_name
           FROM comments c
           JOIN users u ON c.user_id = u.user_id
          WHERE c.blog_id = $1
          ORDER BY c.created_at ASC`,
        [blogId]
    );

    return result.rows;
}

/**
 * Fetches all comments made by a given user, joined with author names.
 * Ordered by creation date descending (newest first).
 */
export async function findCommentsByUserId(userId: string): Promise<CommentWithAuthorRow[]> {
    const result = await pool.query<CommentWithAuthorRow>(
        `SELECT c.comment_id, c.blog_id, c.user_id, c.comment, c.created_at, c.updated_at,
                u.full_name AS author_name
           FROM comments c
           JOIN users u ON c.user_id = u.user_id
          WHERE c.user_id = $1
          ORDER BY c.created_at DESC`,
        [userId]
    );

    return result.rows;
}

/**
 * Updates the text of an existing comment.
 * Returns the updated row joined with author name.
 */
export async function updateComment(
    commentId: string,
    content: string
): Promise<CommentWithAuthorRow> {
    const result = await pool.query<CommentWithAuthorRow>(
        `UPDATE comments
            SET comment    = $2,
                updated_at = NOW()
          WHERE comment_id = $1
          RETURNING
              comment_id, blog_id, user_id, comment, created_at, updated_at,
              (SELECT full_name FROM users WHERE user_id = comments.user_id) AS author_name`,
        [commentId, content]
    );

    const updated = result.rows[0];
    if (!updated) throw new Error(`No comment found with id ${commentId}`);
    return updated;
}

/**
 * Hard-deletes a comment by its primary key.
 */
export async function deleteCommentById(commentId: string): Promise<void> {
    const result = await pool.query(
        `DELETE FROM comments WHERE comment_id = $1`,
        [commentId]
    );

    if ((result.rowCount ?? 0) === 0) {
        throw new Error(`No comment found with id ${commentId}`);
    }
}
