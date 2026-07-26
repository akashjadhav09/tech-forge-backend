import { Router } from "express";

import { authenticateToken } from "../../middlewares/auth.middleware.ts";
import { uploadBlogImage } from "../../middlewares/upload.middleware.ts";
import {
    createNewBlogController,
    getAllBlogsController,
    getBlogDetailsByIdController,
    getAllBlogsByUserIdController,
    updateBlogController,
    publishBlogController,
    deleteBlogController,
    uploadBlogImageController,
} from "./blog.controller.ts";
import { likeRouter } from "../likes/like.routes.ts";
import { dislikeRouter } from "../dislikes/dislike.routes.ts";

export const blogRouter = Router();

// POST /api/v1/blog/upload-image
// Upload a blog cover image (Requires auth)
// Returns: { imageUrl: "http://localhost:5000/assets/blogs/blog-image-<ts>.jpg" }
blogRouter.post("/upload-image", authenticateToken, uploadBlogImage, uploadBlogImageController);

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

// GET /api/v1/blog/user/:id
// Get all blog posts by user id
blogRouter.get("/user/:id", authenticateToken, getAllBlogsByUserIdController);

// PUT /api/v1/blog/:id
// Update an existing blog post (Requires auth & ownership)
blogRouter.put("/:id", authenticateToken, updateBlogController);

// PATCH /api/v1/blog/:id/publish
// Publish a draft blog post (Requires auth & ownership)
blogRouter.patch("/:id/publish", authenticateToken, publishBlogController);

// DELETE /api/v1/blog/:id
// Delete a blog post (Requires auth & ownership)
blogRouter.delete("/:id", authenticateToken, deleteBlogController);

// Nested like routes: POST/DELETE/GET /api/v1/blog/:blogId/like
blogRouter.use("/:blogId/like", likeRouter);

// Nested dislike routes: POST/DELETE/GET /api/v1/blog/:blogId/dislike
blogRouter.use("/:blogId/dislike", dislikeRouter);
