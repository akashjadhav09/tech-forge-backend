import {
    createBlog,
    findBlogById,
    findBlogBySlug,
    searchBlogs,
    updateBlog,
    deleteBlogById,
    incrementBlogViewCount,
} from "./blog.repository.ts";
import type { BlogWithRelationsRow } from "./blog.repository.ts";
import { AppError } from "../../middlewares/error.middleware.ts";
import type {
    BlogResponse,
    BlogRow,
    BlogStatus,
    CreateBlogInput,
    UpdateBlogInput,
} from "./blog.types.ts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps database row model to client response schema.
 */
function toBlogResponse(row: BlogRow | BlogWithRelationsRow): BlogResponse {
    const isRelation = "author_name" in row;
    return {
        blogId: row.blog_id,
        userId: row.user_id,
        categoryId: row.category_id,
        title: row.title,
        slug: row.slug,
        content: row.content,
        coverImage: row.cover_image,
        status: row.status,
        viewCount: row.view_count,
        publishedAt: row.published_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        ...(isRelation && {
            authorName: (row as BlogWithRelationsRow).author_name,
            categoryName: (row as BlogWithRelationsRow).category_name,
        }),
    };
}

/**
 * Generates a unique URL slug from a title.
 */
async function generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    let slug = baseSlug || "untitled";
    let counter = 0;

    while (true) {
        const existing = await findBlogBySlug(slug);
        if (!existing) {
            return slug;
        }
        counter++;
        slug = `${baseSlug}-${counter}`;
    }
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Creates a new blog post.
 */
export async function createNewBlog(
    userId: string,
    data: CreateBlogInput
): Promise<BlogResponse> {
    const slug = await generateUniqueSlug(data.title);
    const categoryId = data.categoryId ?? null;
    const coverImage = data.coverImage ?? null;
    const status: BlogStatus = data.status ?? "Draft";

    const blog = await createBlog({
        userId,
        categoryId,
        title: data.title,
        slug,
        content: data.content,
        coverImage,
        status,
    });

    return toBlogResponse(blog);
}

/**
 * Fetches a list of blogs matching query parameters.
 */
export async function getAllBlogs(filters: {
    searchTerm?: string;
    categoryId?: string;
    status?: BlogStatus;
    limit?: number;
    offset?: number;
}): Promise<BlogResponse[]> {
    const rows = await searchBlogs(filters);
    return rows.map(toBlogResponse);
}

/**
 * Fetches details of a single blog, increments view count, and returns it.
 */
export async function getBlogDetailsById(blogId: string): Promise<BlogResponse> {
    const blog = await findBlogById(blogId);
    if (!blog) {
        throw new AppError(404, "Blog not found");
    }

    // Increment view count asynchronously
    incrementBlogViewCount(blogId).catch((err) => {
        console.error(`Failed to increment view count for blog ${blogId}:`, err);
    });

    return toBlogResponse(blog);
}

/**
 * Updates a blog if it belongs to the authenticated user.
 */
export async function updateCurrentUserBlog(
    blogId: string,
    userId: string,
    updates: UpdateBlogInput
): Promise<BlogResponse> {
    const blog = await findBlogById(blogId);
    if (!blog) {
        throw new AppError(404, "Blog not found");
    }

    if (blog.user_id !== userId) {
        throw new AppError(403, "Forbidden: You cannot modify another user's blog");
    }

    const updatePayload: Parameters<typeof updateBlog>[1] = {};

    if (updates.title !== undefined) {
        updatePayload.title = updates.title;
        updatePayload.slug = await generateUniqueSlug(updates.title);
    }
    if (updates.content !== undefined) {
        updatePayload.content = updates.content;
    }
    if (updates.categoryId !== undefined) {
        updatePayload.categoryId = updates.categoryId;
    }
    if (updates.coverImage !== undefined) {
        updatePayload.coverImage = updates.coverImage;
    }
    if (updates.status !== undefined) {
        updatePayload.status = updates.status;
        if (updates.status === "Published" && blog.status !== "Published") {
            updatePayload.publishedAt = new Date();
        }
    }

    const updatedBlog = await updateBlog(blogId, updatePayload);
    return toBlogResponse(updatedBlog);
}

/**
 * Publishes a blog if it belongs to the authenticated user.
 */
export async function publishBlog(blogId: string, userId: string): Promise<BlogResponse> {
    const blog = await findBlogById(blogId);
    if (!blog) {
        throw new AppError(404, "Blog not found");
    }

    if (blog.user_id !== userId) {
        throw new AppError(403, "Forbidden: You cannot publish another user's blog");
    }

    const updatedBlog = await updateBlog(blogId, {
        status: "Published",
        publishedAt: new Date(),
    });

    return toBlogResponse(updatedBlog);
}

/**
 * Deletes a blog if it belongs to the authenticated user.
 */
export async function deleteCurrentUserBlog(blogId: string, userId: string): Promise<void> {
    const blog = await findBlogById(blogId);
    if (!blog) {
        throw new AppError(404, "Blog not found");
    }

    if (blog.user_id !== userId) {
        throw new AppError(403, "Forbidden: You cannot delete another user's blog");
    }

    await deleteBlogById(blogId);
}