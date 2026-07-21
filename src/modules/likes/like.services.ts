import { findBlogById } from "../blogs/blog.repository.ts";
import { AppError } from "../../middlewares/error.middleware.ts";
import {
    createLike,
    deleteLike,
    getLikeCountByBlogId,
    findLikeByBlogAndUser,
} from "./like.repository.ts";
import type { LikeCountResponse, LikeResponse } from "./like.types.ts";

// ─── Helper ───────────────────────────────────────────────────────────────────

async function assertBlogExists(blogId: string): Promise<void> {
    const blog = await findBlogById(blogId);
    if (!blog) {
        throw new AppError(404, "Blog not found");
    }
}

// ─── GET /blog/:blogId/like ───────────────────────────────────────────────────

/**
 * Returns the like count for a blog and whether the requesting user has liked it.
 * currentUserId is optional — unauthenticated callers get likedByCurrentUser: false.
 */
export async function getBlogLikes(
    blogId: string,
    currentUserId?: string
): Promise<LikeCountResponse> {
    await assertBlogExists(blogId);

    const likeCount = await getLikeCountByBlogId(blogId);

    const likedByCurrentUser =
        currentUserId !== undefined
            ? (await findLikeByBlogAndUser(blogId, currentUserId)) !== null
            : false;

    return { blogId, likeCount, likedByCurrentUser };
}

// ─── POST /blog/:blogId/like ──────────────────────────────────────────────────

/**
 * Adds a like from a user to a blog.
 * Throws 409 if the user has already liked the blog.
 */
export async function likeBlog(
    blogId: string,
    userId: string
): Promise<LikeResponse> {
    await assertBlogExists(blogId);

    const like = await createLike(blogId, userId);

    if (!like) {
        throw new AppError(409, "You have already liked this blog");
    }

    return {
        likeId: like.like_id,
        blogId: like.blog_id,
        userId: like.user_id,
        createdAt: like.created_at,
    };
}

// ─── DELETE /blog/:blogId/like ────────────────────────────────────────────────

/**
 * Removes a like from a user on a blog.
 * Throws 404 if the like does not exist (user hasn't liked this blog).
 */
export async function unlikeBlog(blogId: string, userId: string): Promise<void> {
    await assertBlogExists(blogId);

    const deleted = await deleteLike(blogId, userId);

    if (!deleted) {
        throw new AppError(404, "You have not liked this blog");
    }
}
