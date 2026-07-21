import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.ts";
import {
    createNewBlogController,
    getAllBlogsController,
    getBlogDetailsByIdController,
    updateBlogController,
    publishBlogController,
    deleteBlogController,
} from "./blog.controller.ts";

export const blogRouter = Router();

// POST /api/v1/blog
// Create a new blog post (Requires auth)
blogRouter.post("/", authenticateToken, createNewBlogController);

// GET /api/v1/blog
// Get list of blogs (Public)
blogRouter.get("/", getAllBlogsController);

// GET /api/v1/blog/search
// Search blogs (Public)
// NOTE: Declared BEFORE GET /:id so "search" is not treated as a blog ID
blogRouter.get("/search", getAllBlogsController);

// GET /api/v1/blog/:id
// Get detail of a blog post by ID (Public)
blogRouter.get("/:id", getBlogDetailsByIdController);

// PUT /api/v1/blog/:id
// Update an existing blog post (Requires auth & ownership)
blogRouter.put("/:id", authenticateToken, updateBlogController);

// PATCH /api/v1/blog/:id/publish
// Publish a draft blog post (Requires auth & ownership)
blogRouter.patch("/:id/publish", authenticateToken, publishBlogController);

// DELETE /api/v1/blog/:id
// Delete a blog post (Requires auth & ownership)
blogRouter.delete("/:id", authenticateToken, deleteBlogController);
