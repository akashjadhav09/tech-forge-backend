import type { Request, Response, NextFunction } from "express";
import {
    getCurrentUserDetails,
    getUserDetailsById,
    updateCurrentUserProfileDetails,
    updateCurrentUserAvatar,
    deleteCurrentUser,
} from "./user.service.ts";
import { AppError } from "../../middlewares/error.middleware.ts";
import type { UpdateProfileInput } from "../auth/auth.types.ts";

// ─── Shared guard ─────────────────────────────────────────────────────────────

function requireUserId(req: Request): string {
    if (!req.user?.userId) {
        throw new AppError(401, "Unauthorized: no user in request.");
    }
    return req.user.userId;
}

// ─── POST /users/upload-profile-image ────────────────────────────────────────

export async function uploadProfileImageController(req: Request, res: Response) {
    if (!req.file) {
        res.status(400).json({ message: "No file uploaded." });
        return;
    }

    res.status(200).json({
        message: "Profile image uploaded successfully.",
        file: {
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
        },
    });
}

// ─── GET /users/me ────────────────────────────────────────────────────────────

export async function getCurrentUserProfileDetailsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.log("In get current user profile details controller")
    try {
        const userId = requireUserId(req);
        const userProfile = await getCurrentUserDetails(userId);

        res.status(200).json({
            success: true,
            message: "User profile fetched successfully.",
            data: userProfile,
        });
    } catch (error) {
        next(error);
    }
}

// ─── GET /users/:id ─────────────────────────────────────────────────────────

export async function getUserDetailsByIdController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const rawId = req.params["id"];
        const id = Array.isArray(rawId) ? rawId[0] : rawId;

        if (!id) {
            throw new AppError(400, "User id is required.");
        }

        const userProfile = await getUserDetailsById(id);

        res.status(200).json({
            success: true,
            message: "User profile fetched successfully.",
            data: userProfile,
        });
    } catch (error) {
        next(error);
    }
}

// ─── PUT /users/me ────────────────────────────────────────────────────────────

export async function updateCurrentUserProfileDetailsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = requireUserId(req);

        // Pick only allowed fields from body — prevents mass assignment
        const { fullName, email, bio } = req.body as UpdateProfileInput;

        // Reject if none of the allowed fields were provided
        if (!fullName && !email && !bio) {
            throw new AppError(400, "Provide at least one field to update: fullName, email, or bio.");
        }

        // Conditional spread satisfies exactOptionalPropertyTypes:
        // optional props must be absent (not set to undefined)
        const updates: UpdateProfileInput = {
            ...(fullName !== undefined && { fullName }),
            ...(email !== undefined && { email }),
            ...(bio !== undefined && { bio }),
        };

        const userProfile = await updateCurrentUserProfileDetails(userId, updates);

        res.status(200).json({
            success: true,
            message: "User profile updated successfully.",
            data: userProfile,
        });
    } catch (error) {
        next(error);
    }
}

// ─── PATCH /users/me/avatar ───────────────────────────────────────────────────

export async function updateUserAvatarController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = requireUserId(req);

        if (!req.file) {
            throw new AppError(400, "No image file uploaded.");
        }

        const userProfile = await updateCurrentUserAvatar(userId, req.file.path);

        res.status(200).json({
            success: true,
            message: "Avatar updated successfully.",
            data: userProfile,
        });
    } catch (error) {
        next(error);
    }
}

// ─── DELETE /users/me ─────────────────────────────────────────────────────────

export async function deleteCurrentUserController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = requireUserId(req);
        await deleteCurrentUser(userId);

        res.status(200).json({
            success: true,
            message: "Account deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
}
