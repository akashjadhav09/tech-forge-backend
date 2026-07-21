import type { NextFunction, Request, Response } from "express";
import {
    createNewBlog,
    getAllBlogs,
    getBlogDetailsById,
    updateCurrentUserBlog,
    publishBlog,
    deleteCurrentUserBlog,
} from "./blog.service.ts";
import { AppError } from "../../middlewares/error.middleware.ts";
import type { CreateBlogInput, UpdateBlogInput, BlogStatus } from "./blog.types.ts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function requireUserId(req: Request): string {
    if (!req.user?.userId) {
        throw new AppError(401, "Unauthorized: login required.");
    }
    return req.user.userId;
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/v1/blog
 * Creates a new blog post. (Requires auth)
 */
export async function createNewBlogController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = requireUserId(req);
        const { title, content, categoryId, coverImage, status } = req.body as CreateBlogInput;

        if (!title || !content) {
            throw new AppError(400, "Title and content are required.");
        }

        const blog = await createNewBlog(userId, {
            title,
            content,
            ...(categoryId !== undefined && { categoryId }),
            ...(coverImage !== undefined && { coverImage }),
            ...(status !== undefined && { status }),
        });

        res.status(201).json({
            success: true,
            message: "Blog created successfully",
            data: blog,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/v1/blog
 * Lists all blogs (defaults to Published status unless filtered).
 */
export async function getAllBlogsController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const limitParam = req.query["limit"];
        const offsetParam = req.query["offset"];
        const termParam = req.query["q"] ?? req.query["searchTerm"];
        const catParam = req.query["categoryId"];
        const statusParam = req.query["status"];

        const limit = typeof limitParam === "string" ? parseInt(limitParam, 10) : undefined;
        const offset = typeof offsetParam === "string" ? parseInt(offsetParam, 10) : undefined;
        const searchTerm = typeof termParam === "string" ? termParam : undefined;
        const categoryId = typeof catParam === "string" ? catParam : undefined;
        const status = typeof statusParam === "string" ? (statusParam as BlogStatus) : undefined;

        const filters = {
            ...(limit !== undefined && !isNaN(limit) && { limit }),
            ...(offset !== undefined && !isNaN(offset) && { offset }),
            ...(searchTerm !== undefined && { searchTerm }),
            ...(categoryId !== undefined && { categoryId }),
            ...(status !== undefined && { status }),
        };

        const blogs = await getAllBlogs(filters);

        res.status(200).json({
            success: true,
            message: "Blogs fetched successfully",
            data: blogs,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/v1/blog/:id
 * Fetches detail of a single blog by ID and tracks views.
 */
export async function getBlogDetailsByIdController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const rawId = req.params["id"];
        const id = Array.isArray(rawId) ? rawId[0] : rawId;

        if (!id) {
            throw new AppError(400, "Blog id is required.");
        }

        const blog = await getBlogDetailsById(id);

        res.status(200).json({
            success: true,
            message: "Blog details fetched successfully",
            data: blog,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/v1/blog/:id
 * Updates an existing blog post (Requires ownership & auth)
 */
export async function updateBlogController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = requireUserId(req);
        const rawId = req.params["id"];
        const id = Array.isArray(rawId) ? rawId[0] : rawId;

        if (!id) {
            throw new AppError(400, "Blog id is required.");
        }

        const { title, content, categoryId, coverImage, status } = req.body as UpdateBlogInput;

        if (
            title === undefined &&
            content === undefined &&
            categoryId === undefined &&
            coverImage === undefined &&
            status === undefined
        ) {
            throw new AppError(400, "Provide at least one field to update.");
        }

        const updates: UpdateBlogInput = {
            ...(title !== undefined && { title }),
            ...(content !== undefined && { content }),
            ...(categoryId !== undefined && { categoryId }),
            ...(coverImage !== undefined && { coverImage }),
            ...(status !== undefined && { status }),
        };

        const blog = await updateCurrentUserBlog(id, userId, updates);

        res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            data: blog,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /api/v1/blog/:id/publish
 * Publishes a blog post. (Requires ownership & auth)
 */
export async function publishBlogController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = requireUserId(req);
        const rawId = req.params["id"];
        const id = Array.isArray(rawId) ? rawId[0] : rawId;

        if (!id) {
            throw new AppError(400, "Blog id is required.");
        }

        const blog = await publishBlog(id, userId);

        res.status(200).json({
            success: true,
            message: "Blog published successfully",
            data: blog,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/v1/blog/:id
 * Deletes a blog post. (Requires ownership & auth)
 */
export async function deleteBlogController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = requireUserId(req);
        const rawId = req.params["id"];
        const id = Array.isArray(rawId) ? rawId[0] : rawId;

        if (!id) {
            throw new AppError(400, "Blog id is required.");
        }

        await deleteCurrentUserBlog(id, userId);

        res.status(200).json({
            success: true,
            message: "Blog deleted successfully",
        });
    } catch (error) {
        next(error);
    }
}