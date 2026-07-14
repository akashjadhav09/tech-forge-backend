CREATE TABLE IF NOT EXISTS comments (
    comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id UUID NOT NULL,
    user_id UUID NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_comment_blog
        FOREIGN KEY(blog_id)
        REFERENCES blogs(blog_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);