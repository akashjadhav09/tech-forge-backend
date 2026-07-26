CREATE TABLE IF NOT EXISTS dislikes (
    dislike_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id    UUID NOT NULL,
    user_id    UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_dislike_blog
        FOREIGN KEY(blog_id)
        REFERENCES blogs(blog_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_dislike_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_blog_dislike
        UNIQUE(blog_id, user_id)
);
