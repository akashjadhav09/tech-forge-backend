import {
    createComment,
    findCommentById,
    findCommentsByBlogId,
    findCommentsByUserId,
    updateComment,
    deleteCommentById,
} from "./comment.repository.ts";
import { findBlogById } from "../blogs/blog.repository.ts";
import { findUserById } from "../users/user.repository.ts";
import { AppError } from "../../middlewares/error.middleware.ts";
import type { CommentRow, CommentWithAuthorRow, CommentResponse } from "./comment.types.ts";

// ─── Helper ───────────────────────────────────────────────────────────────────

function toCommentResponse(row: CommentRow | CommentWithAuthorRow): CommentResponse {
    return {
        commentId: row.comment_id,
        blogId: row.blog_id,
        userId: row.user_id,
        content: row.comment,
        authorName: "author_name" in row ? row.author_name : "",
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

// ─── GET /comments/:blogId ────────────────────────────────────────────────────

/**
 * Returns all comments for a blog.
 * Validates the blog exists first.
 */
export async function getCommentsByBlogId(blogId: string): Promise<CommentResponse[]> {
    const blog = await findBlogById(blogId);
    if (!blog) {
        throw new AppError(404, "Blog not found");
    }

    const rows = await findCommentsByBlogId(blogId);
    return rows.map(toCommentResponse);
}

// ─── GET /comments/user/:userId ───────────────────────────────────────────────

/**
 * Returns all comments made by a user.
 * Validates the user exists first.
 */
export async function getCommentsByUserId(userId: string): Promise<CommentResponse[]> {
    const user = await findUserById(userId);
    if (!user) {
        throw new AppError(404, "User not found");
    }

    const rows = await findCommentsByUserId(userId);
    return rows.map(toCommentResponse);
}

// ─── POST /comment ────────────────────────────────────────────────────────────

/**
 * Creates a new comment on a blog post.
 * Validates both the blog and user exist before inserting.
 */
export async function createNewComment(
    userId: string,
    blogId: string,
    content: string
): Promise<CommentResponse> {
    const blog = await findBlogById(blogId);
    if (!blog) {
        throw new AppError(404, "Blog not found");
    }

    const user = await findUserById(userId);
    if (!user) {
        throw new AppError(404, "User not found");
    }

    const comment = await createComment({ blogId, userId, content });
    return toCommentResponse(comment);
}

// ─── PUT /comment/:id ─────────────────────────────────────────────────────────

/**
 * Updates the content of a comment.
 * Only the comment owner can update it (ownership check).
 */
export async function updateExistingComment(
    commentId: string,
    userId: string,
    content: string
): Promise<CommentResponse> {
    const comment = await findCommentById(commentId);
    if (!comment) {
        throw new AppError(404, "Comment not found");
    }

    if (comment.user_id !== userId) {
        throw new AppError(403, "Forbidden: You cannot modify another user's comment");
    }

    const updated = await updateComment(commentId, content);
    return toCommentResponse(updated);
}

// ─── DELETE /comment/:id ──────────────────────────────────────────────────────

/**
 * Deletes a comment.
 * Only the comment owner can delete it (ownership check).
 */
export async function deleteExistingComment(
    commentId: string,
    userId: string
): Promise<void> {
    const comment = await findCommentById(commentId);
    if (!comment) {
        throw new AppError(404, "Comment not found");
    }

    if (comment.user_id !== userId) {
        throw new AppError(403, "Forbidden: You cannot delete another user's comment");
    }

    await deleteCommentById(commentId);
}