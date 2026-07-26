import { Router } from "express";

import { authenticateToken } from "../../middlewares/auth.middleware.ts";
import {
    getBlogDislikesController,
    dislikeBlogController,
    removeDislikeBlogController,
} from "./dislike.controller.ts";

export const dislikeRouter = Router({ mergeParams: true });

// GET    /api/v1/blog/:blogId/dislike  — get dislike count + current user disliked status (Public)
dislikeRouter.get("/", getBlogDislikesController);

// POST   /api/v1/blog/:blogId/dislike  — dislike a blog (Requires auth)
dislikeRouter.post("/", authenticateToken, dislikeBlogController);

// DELETE /api/v1/blog/:blogId/dislike  — remove dislike from a blog (Requires auth)
dislikeRouter.delete("/", authenticateToken, removeDislikeBlogController);
