import type { NextFunction, Request, Response } from "express";

import { getBlogDislikes, dislikeBlog, removeDislikeBlog } from "./dislike.services.ts";
import { AppError } from "../../middlewares/error.middleware.ts";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function requireUserId(req: Request): string {
    if (!req.user?.userId) {
        throw new AppError(401, "Unauthorized: login required.");
    }
    return req.user.userId;
}

function extractParam(req: Request, key: string): string {
    const raw = req.params[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value) {
        throw new AppError(400, `Missing required route parameter: ${key}`);
    }
    return value;
}

// ─── GET /api/v1/blog/:blogId/dislike ────────────────────────────────────────

/**
 * Returns the dislike count and whether the requesting user has disliked the blog.
 * Public route — currentUserId is passed only when authenticated.
 */
export async function getBlogDislikesController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const blogId = extractParam(req, "blogId");
        const currentUserId = req.user?.userId; // optional — may be undefined for public access

        const data = await getBlogDislikes(blogId, currentUserId);

        res.status(200).json({
            success: true,
            message: "Blog dislikes fetched successfully",
            data,
        });
    } catch (error) {
        next(error);
    }
}

// ─── POST /api/v1/blog/:blogId/dislike ───────────────────────────────────────

/**
 * Dislikes a blog post. Requires authentication.
 */
export async function dislikeBlogController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = requireUserId(req);
        const blogId = extractParam(req, "blogId");

        const dislike = await dislikeBlog(blogId, userId);

        res.status(201).json({
            success: true,
            message: "Blog disliked successfully",
            data: dislike,
        });
    } catch (error) {
        next(error);
    }
}

// ─── DELETE /api/v1/blog/:blogId/dislike ─────────────────────────────────────

/**
 * Removes a dislike from a blog post. Requires authentication.
 */
export async function removeDislikeBlogController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = requireUserId(req);
        const blogId = extractParam(req, "blogId");

        await removeDislikeBlog(blogId, userId);

        res.status(200).json({
            success: true,
            message: "Blog dislike removed successfully",
        });
    } catch (error) {
        next(error);
    }
}
