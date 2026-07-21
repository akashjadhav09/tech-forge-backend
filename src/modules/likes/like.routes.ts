import { Router } from "express";

import { authenticateToken } from "../../middlewares/auth.middleware.ts";
import {
    getBlogLikesController,
    likeBlogController,
    unlikeBlogController,
} from "./like.controller.ts";

export const likeRouter = Router({ mergeParams: true });

// GET    /api/v1/blog/:blogId/like  — get like count + current user liked status (Public)
likeRouter.get("/", getBlogLikesController);

// POST   /api/v1/blog/:blogId/like  — like a blog (Requires auth)
likeRouter.post("/", authenticateToken, likeBlogController);

// DELETE /api/v1/blog/:blogId/like  — unlike a blog (Requires auth)
likeRouter.delete("/", authenticateToken, unlikeBlogController);
