import type { NextFunction, Request, Response } from "express";

import {
    getCommentsByBlogId,
    getCommentsByUserId,
    createNewComment,
    updateExistingComment,
    deleteExistingComment,
} from "./comment.service.ts";
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

// ─── GET /api/v1/comments/:blogId ────────────────────────────────────────────

export async function getCommentsByBlogIdController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const blogId = extractParam(req, "blogId");
        const comments = await getCommentsByBlogId(blogId);

        res.status(200).json({
            success: true,
            message: "Comments fetched successfully",
            data: comments,
        });
    } catch (error) {
        next(error);
    }
}

// ─── GET /api/v1/comments/user/:userId ───────────────────────────────────────

export async function getCommentsByUserIdController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = extractParam(req, "userId");
        const comments = await getCommentsByUserId(userId);

        res.status(200).json({
            success: true,
            message: "Comments fetched successfully",
            data: comments,
        });
    } catch (error) {
        next(error);
    }
}

// ─── POST /api/v1/comment ────────────────────────────────────────────────────

export async function createNewCommentController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = requireUserId(req);
        const { blogId, content } = req.body as { blogId?: string; content?: string };

        if (!blogId) {
            throw new AppError(400, "blogId is required.");
        }
        if (!content || content.trim() === "") {
            throw new AppError(400, "Comment content cannot be empty.");
        }

        const comment = await createNewComment(userId, blogId, content.trim());

        res.status(201).json({
            success: true,
            message: "Comment created successfully",
            data: comment,
        });
    } catch (error) {
        next(error);
    }
}

// ─── PUT /api/v1/comment/:id ─────────────────────────────────────────────────

export async function updateCommentController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = requireUserId(req);
        const commentId = extractParam(req, "id");
        const { content } = req.body as { content?: string };

        if (!content || content.trim() === "") {
            throw new AppError(400, "Comment content cannot be empty.");
        }

        const updated = await updateExistingComment(commentId, userId, content.trim());

        res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            data: updated,
        });
    } catch (error) {
        next(error);
    }
}

// ─── DELETE /api/v1/comment/:id ──────────────────────────────────────────────

export async function deleteCommentController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = requireUserId(req);
        const commentId = extractParam(req, "id");

        await deleteExistingComment(commentId, userId);

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
        });
    } catch (error) {
        next(error);
    }
}