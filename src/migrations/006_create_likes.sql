CREATE TABLE IF NOT EXISTS likes (
    like_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_like_blog
        FOREIGN KEY(blog_id)
        REFERENCES blogs(blog_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_like_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_blog_like
        UNIQUE(blog_id, user_id)
);