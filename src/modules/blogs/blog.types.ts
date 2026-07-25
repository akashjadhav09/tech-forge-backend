// ─── Blog Status Type ─────────────────────────────────────────────────────────
export type BlogStatus = "Draft" | "Published" | "Archived";

// ─── Request / Input Types ───────────────────────────────────────────────────

export interface CreateBlogInput {
    categoryId?: string; // Optional since category_id can be NULL in DB
    title: string;
    content: string;
    coverImage?: string; // Optional
    tags?: string[];     // Optional, defaults to empty array
    status?: BlogStatus; // Optional, defaults to 'Draft'
}

// Alias for compatibility if user imports with lowercase c
export type createBlogInput = CreateBlogInput;

export interface UpdateBlogInput {
    categoryId?: string;
    title?: string;
    content?: string;
    coverImage?: string;
    tags?: string[];
    status?: BlogStatus;
}

// ─── Database Row Type ───────────────────────────────────────────────────────

export interface BlogRow {
    blog_id: string;
    user_id: string;
    category_id: string | null;
    title: string;
    slug: string;
    content: string;
    cover_image: string | null;
    tags: string[];
    status: BlogStatus;
    view_count: number;
    published_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

// ─── Response Type ───────────────────────────────────────────────────────────

export interface BlogResponse {
    blogId: string;
    userId: string;
    categoryId: string | null;
    title: string;
    slug: string;
    content: string;
    coverImage: string | null;
    tags: string[];
    status: BlogStatus;
    viewCount: number;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    authorName?: string; // Optional joined author name
    categoryName?: string | null; // Optional joined category name
}