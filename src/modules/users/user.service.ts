import {
    findUserById,
    updateUserProfileDetails,
    updateUserAvatar,
    deleteUserById,
} from "./user.repository.ts";
import { AppError } from "../../middlewares/error.middleware.ts";
import type { UserProfile, UpdateProfileInput } from "../auth/auth.types.ts";

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Maps a DB UserRow (snake_case) to the safe client-facing UserProfile (camelCase). */
function toUserProfile(user: Awaited<ReturnType<typeof findUserById>> & object): UserProfile {
    return {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        bio: user.bio,
        profileImage: user.profile_image,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
    };
}

// Returns the full profile of the currently authenticated user.
export async function getCurrentUserDetails(userId: string): Promise<UserProfile> {
    const user = await findUserById(userId);
    if (!user) {
        throw new AppError(404, "User not found");
    }

    return toUserProfile(user);
}

// Returns the public profile of any user by their id.
export async function getUserDetailsById(userId: string): Promise<UserProfile> {
    const user = await findUserById(userId);

    if (!user) {
        throw new AppError(404, "User not found");
    }

    return toUserProfile(user);
}

// Updates the authenticated user's text profile fields (fullName, email, bio).
export async function updateCurrentUserProfileDetails(userId: string, updates: UpdateProfileInput): Promise<UserProfile> {
    const user = await findUserById(userId);
    if (!user) {
        throw new AppError(404, "User not found");
    }

    const updated = await updateUserProfileDetails({
        userId,
        ...(updates.fullName !== undefined && { fullName: updates.fullName }),
        ...(updates.email !== undefined && { email: updates.email }),
        ...(updates.bio !== undefined && { bio: updates.bio }),
    });

    return toUserProfile(updated);
}

// Updates the authenticated user's profile image path.
export async function updateCurrentUserAvatar(userId: string, profileImage: string): Promise<UserProfile> {
    const user = await findUserById(userId);
    if (!user) {
        throw new AppError(404, "User not found");
    }

    const updated = await updateUserAvatar(userId, profileImage);
    return toUserProfile(updated);
}

// Permanently deletes the authenticated user's account.
export async function deleteCurrentUser(userId: string): Promise<void> {
    const user = await findUserById(userId);
    if (!user) {
        throw new AppError(404, "User not found");
    }

    await deleteUserById(userId);
}