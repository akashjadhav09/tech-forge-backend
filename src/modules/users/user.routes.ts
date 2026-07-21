import { Router } from "express";

import { authenticateToken } from "../../middlewares/auth.middleware.ts";
import { uploadAvatar } from "../../middlewares/upload.middleware.ts";
import {
    uploadProfileImageController,
    getCurrentUserProfileDetailsController,
    getUserDetailsByIdController,
    updateCurrentUserProfileDetailsController,
    updateUserAvatarController,
    deleteCurrentUserController,
} from "./user.controller.ts";

export const userRouter = Router();

// GET    /api/v1/users/me              — fetch current user's profile
userRouter.get("/me", authenticateToken, getCurrentUserProfileDetailsController);

// PUT    /api/v1/users/me              — update profile text fields (fullName, email, bio)
userRouter.put("/me", authenticateToken, updateCurrentUserProfileDetailsController);

// PATCH  /api/v1/users/me/avatar      — replace profile picture
userRouter.patch("/me/avatar", authenticateToken, uploadAvatar, updateUserAvatarController);

// DELETE /api/v1/users/me             — permanently delete account
userRouter.delete("/me", authenticateToken, deleteCurrentUserController);

// GET    /api/v1/users/:id            — fetch any user's public profile
userRouter.get("/:id", authenticateToken, getUserDetailsByIdController);

// POST   /api/v1/users/upload-profile-image   — legacy upload endpoint
userRouter.post(
    "/upload-profile-image",
    authenticateToken,
    uploadAvatar,
    uploadProfileImageController
);