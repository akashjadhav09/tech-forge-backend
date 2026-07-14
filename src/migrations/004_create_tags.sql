CREATE TABLE IF NOT EXISTS tags (
    tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_tags (
    blog_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    
    PRIMARY KEY(blog_id, tag_id),

    CONSTRAINT fk_blog_tags_blog
        FOREIGN KEY(blog_id)
        REFERENCES blogs(blog_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_blog_tags_tag
        FOREIGN KEY(tag_id)
        REFERENCES tags(tag_id)
        ON DELETE CASCADE
);