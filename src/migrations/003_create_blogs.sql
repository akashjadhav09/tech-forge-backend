CREATE TABLE IF NOT EXISTS blogs (
    blog_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    category_id UUID,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft',
    view_count INTEGER NOT NULL DEFAULT 0,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_blog_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_blog_category
        FOREIGN KEY(category_id)
        REFERENCES categories(category_id)
        ON DELETE SET NULL,

    CONSTRAINT chk_blog_status
        CHECK (status IN ('Draft', 'Published', 'Archived'))
);