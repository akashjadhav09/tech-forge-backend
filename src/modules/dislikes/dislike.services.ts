import { findBlogById } from "../blogs/blog.repository.ts";
import { AppError } from "../../middlewares/error.middleware.ts";
import {
    createDislike,
    deleteDislike,
    getDislikeCountByBlogId,
    findDislikeByBlogAndUser,
} from "./dislike.repository.ts";
import type { DislikeCountResponse, DislikeResponse } from "./dislike.types.ts";

// ─── Helper ───────────────────────────────────────────────────────────────────

async function assertBlogExists(blogId: string): Promise<void> {
    const blog = await findBlogById(blogId);
    if (!blog) {
        throw new AppError(404, "Blog not found");
    }
}

// ─── GET /blog/:blogId/dislike ────────────────────────────────────────────────

/**
 * Returns the dislike count for a blog and whether the requesting user has disliked it.
 * currentUserId is optional — unauthenticated callers get dislikedByCurrentUser: false.
 */
export async function getBlogDislikes(
    blogId: string,
    currentUserId?: string
): Promise<DislikeCountResponse> {
    await assertBlogExists(blogId);

    const dislikeCount = await getDislikeCountByBlogId(blogId);

    const dislikedByCurrentUser =
        currentUserId !== undefined
            ? (await findDislikeByBlogAndUser(blogId, currentUserId)) !== null
            : false;

    return { blogId, dislikeCount, dislikedByCurrentUser };
}

// ─── POST /blog/:blogId/dislike ───────────────────────────────────────────────

/**
 * Adds a dislike from a user to a blog.
 * Throws 409 if the user has already disliked the blog.
 */
export async function dislikeBlog(
    blogId: string,
    userId: string
): Promise<DislikeResponse> {
    await assertBlogExists(blogId);

    const dislike = await createDislike(blogId, userId);

    if (!dislike) {
        throw new AppError(409, "You have already disliked this blog");
    }

    return {
        dislikeId: dislike.dislike_id,
        blogId: dislike.blog_id,
        userId: dislike.user_id,
        createdAt: dislike.created_at,
    };
}

// ─── DELETE /blog/:blogId/dislike ─────────────────────────────────────────────

/**
 * Removes a dislike from a user on a blog.
 * Throws 404 if the dislike does not exist (user hasn't disliked this blog).
 */
export async function removeDislikeBlog(blogId: string, userId: string): Promise<void> {
    await assertBlogExists(blogId);

    const deleted = await deleteDislike(blogId, userId);

    if (!deleted) {
        throw new AppError(404, "You have not disliked this blog");
    }
}
