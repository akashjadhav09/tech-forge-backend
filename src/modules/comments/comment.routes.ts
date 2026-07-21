import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.ts";
import {
    getCommentsByBlogIdController,
    getCommentsByUserIdController,
    createNewCommentController,
    updateCommentController,
    deleteCommentController,
} from "./comment.controller.ts";

export const commentRouter = Router();

// GET /api/v1/comments/user/:userId — all comments by a specific user (Public)
// NOTE: declared BEFORE /:blogId so the literal "user" segment is matched first
commentRouter.get("/user/:userId", getCommentsByUserIdController);

// GET /api/v1/comments/:blogId — all comments for a blog (Public)
commentRouter.get("/:blogId", getCommentsByBlogIdController);

// POST /api/v1/comment — create a new comment (Requires auth)
// blogId and content are passed in the request body
commentRouter.post("/", authenticateToken, createNewCommentController);

// PUT /api/v1/comment/:id — update a comment (Requires auth & ownership)
commentRouter.put("/:id", authenticateToken, updateCommentController);

// DELETE /api/v1/comment/:id — delete a comment (Requires auth & ownership)
commentRouter.delete("/:id", authenticateToken, deleteCommentController);