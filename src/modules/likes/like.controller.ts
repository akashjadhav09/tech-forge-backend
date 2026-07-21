import type { NextFunction, Request, Response } from "express";

import { getBlogLikes, likeBlog, unlikeBlog } from "./like.services.ts";
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

// ─── GET /api/v1/blog/:blogId/like ───────────────────────────────────────────

/**
 * Returns the like count and whether the requesting user has liked the blog.
 * Public route — currentUserId is passed only when authenticated.
 */
export async function getBlogLikesController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const blogId = extractParam(req, "blogId");
        const currentUserId = req.user?.userId; // optional — may be undefined for public access

        const data = await getBlogLikes(blogId, currentUserId);

        res.status(200).json({
            success: true,
            message: "Blog likes fetched successfully",
            data,
        });
    } catch (error) {
        next(error);
    }
}

// ─── POST /api/v1/blog/:blogId/like ──────────────────────────────────────────

/**
 * Likes a blog post. Requires authentication.
 */
export async function likeBlogController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = requireUserId(req);
        const blogId = extractParam(req, "blogId");

        const like = await likeBlog(blogId, userId);

        res.status(201).json({
            success: true,
            message: "Blog liked successfully",
            data: like,
        });
    } catch (error) {
        next(error);
    }
}

// ─── DELETE /api/v1/blog/:blogId/like ────────────────────────────────────────

/**
 * Removes a like from a blog post. Requires authentication.
 */
export async function unlikeBlogController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = requireUserId(req);
        const blogId = extractParam(req, "blogId");

        await unlikeBlog(blogId, userId);

        res.status(200).json({
            success: true,
            message: "Blog unliked successfully",
        });
    } catch (error) {
        next(error);
    }
}
