import { pool } from "../../config/db.ts";
import type { BlogRow, BlogStatus } from "./blog.types.ts";

export type BlogWithRelationsRow = BlogRow & {
    author_name: string;
    category_name: string | null;
};

/**
 * Inserts a new blog post into the database.
 */
export async function createBlog(data: {
    userId: string;
    categoryId: string | null;
    title: string;
    slug: string;
    content: string;
    coverImage: string | null;
    status: BlogStatus;
}): Promise<BlogRow> {
    const result = await pool.query<BlogRow>(
        `INSERT INTO blogs (user_id, category_id, title, slug, content, cover_image, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING blog_id, user_id, category_id, title, slug, content, cover_image, status, view_count, published_at, created_at, updated_at`,
        [
            data.userId,
            data.categoryId,
            data.title,
            data.slug,
            data.content,
            data.coverImage,
            data.status,
        ]
    );

    const blog = result.rows[0];
    if (!blog) throw new Error("Insert succeeded but returned no row");
    return blog;
}

/**
 * Finds a blog by ID, joining user details and category details.
 */
export async function findBlogById(blogId: string): Promise<BlogWithRelationsRow | null> {
    const result = await pool.query<BlogWithRelationsRow>(
        `SELECT b.*, u.full_name AS author_name, c.name AS category_name
         FROM blogs b
         JOIN users u ON b.user_id = u.user_id
         LEFT JOIN categories c ON b.category_id = c.category_id
         WHERE b.blog_id = $1
         LIMIT 1`,
        [blogId]
    );

    return result.rows[0] ?? null;
}

/**
 * Finds a blog by its unique slug.
 */
export async function findBlogBySlug(slug: string): Promise<BlogRow | null> {
    const result = await pool.query<BlogRow>(
        `SELECT * FROM blogs WHERE slug = $1 LIMIT 1`,
        [slug]
    );

    return result.rows[0] ?? null;
}

/**
 * Dynamic search query for blogs.
 */
export async function searchBlogs(filters: {
    searchTerm?: string;
    categoryId?: string;
    status?: BlogStatus;
    limit?: number;
    offset?: number;
}): Promise<BlogWithRelationsRow[]> {
    const conditions: string[] = [];
    const values: (string | number)[] = [];

    // Filter by published unless otherwise requested
    if (filters.status) {
        conditions.push(`b.status = $${values.push(filters.status)}`);
    } else {
        conditions.push(`b.status = 'Published'`);
    }

    if (filters.categoryId) {
        conditions.push(`b.category_id = $${values.push(filters.categoryId)}`);
    }

    if (filters.searchTerm) {
        // Search in title and content case-insensitively
        conditions.push(
            `(b.title ILIKE $${values.push(`%${filters.searchTerm}%`)} OR b.content ILIKE $${values.length})`
        );
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const limitVal = filters.limit ?? 10;
    const offsetVal = filters.offset ?? 0;
    values.push(limitVal);
    const limitPlaceholder = `$${values.length}`;
    values.push(offsetVal);
    const offsetPlaceholder = `$${values.length}`;

    const query = `
        SELECT b.*, u.full_name AS author_name, c.name AS category_name
        FROM blogs b
        JOIN users u ON b.user_id = u.user_id
        LEFT JOIN categories c ON b.category_id = c.category_id
        ${whereClause}
        ORDER BY b.created_at DESC
        LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}
    `;

    const result = await pool.query<BlogWithRelationsRow>(query, values);
    return result.rows;
}

/**
 * Partially updates a blog post.
 */
export async function updateBlog(
    blogId: string,
    updates: {
        categoryId?: string | null;
        title?: string;
        slug?: string;
        content?: string;
        coverImage?: string | null;
        status?: BlogStatus;
        publishedAt?: Date | null;
    }
): Promise<BlogRow> {
    const setClause: string[] = [];
    const values: (string | Date | null)[] = [];
    
    // Explicitly check for fields using property check or !== undefined
    if (updates.categoryId !== undefined) {
        setClause.push(`category_id = $${values.push(updates.categoryId)}`);
    }
    if (updates.title !== undefined) {
        setClause.push(`title = $${values.push(updates.title)}`);
    }
    if (updates.slug !== undefined) {
        setClause.push(`slug = $${values.push(updates.slug)}`);
    }
    if (updates.content !== undefined) {
        setClause.push(`content = $${values.push(updates.content)}`);
    }
    if (updates.coverImage !== undefined) {
        setClause.push(`cover_image = $${values.push(updates.coverImage)}`);
    }
    if (updates.status !== undefined) {
        setClause.push(`status = $${values.push(updates.status)}`);
    }
    if (updates.publishedAt !== undefined) {
        setClause.push(`published_at = $${values.push(updates.publishedAt)}`);
    }

    if (setClause.length === 0) {
        const current = await findBlogById(blogId);
        if (!current) throw new Error(`No blog found with id ${blogId}`);
        return current;
    }

    setClause.push(`updated_at = NOW()`);
    values.push(blogId);
    const idPlaceholder = `$${values.length}`;

    const query = `
        UPDATE blogs
        SET ${setClause.join(", ")}
        WHERE blog_id = ${idPlaceholder}
        RETURNING blog_id, user_id, category_id, title, slug, content, cover_image, status, view_count, published_at, created_at, updated_at
    `;

    const result = await pool.query<BlogRow>(query, values);
    const updatedBlog = result.rows[0];

    if (!updatedBlog) {
        throw new Error(`No blog found with id ${blogId}`);
    }

    return updatedBlog;
}

/**
 * Deletes a blog by ID.
 */
export async function deleteBlogById(blogId: string): Promise<void> {
    const result = await pool.query(`DELETE FROM blogs WHERE blog_id = $1`, [blogId]);
    if ((result.rowCount ?? 0) === 0) {
        throw new Error(`No blog found with id ${blogId}`);
    }
}

/**
 * Increments view count by 1.
 */
export async function incrementBlogViewCount(blogId: string): Promise<void> {
    await pool.query(`UPDATE blogs SET view_count = view_count + 1 WHERE blog_id = $1`, [blogId]);
}
