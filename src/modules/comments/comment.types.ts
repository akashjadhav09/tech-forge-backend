// ─── Database Row Type ───────────────────────────────────────────────────────

export interface CommentRow {
    comment_id: string;
    blog_id: string;
    user_id: string;
    comment: string;
    created_at: Date;
    updated_at: Date;
}

export interface CommentWithAuthorRow extends CommentRow {
    author_name: string;
}

// ─── Request / Input Types ───────────────────────────────────────────────────

export interface CreateCommentInput {
    blogId: string;
    content: string;
}

export interface UpdateCommentInput {
    content: string;
}

// ─── Response Type ───────────────────────────────────────────────────────────

export interface CommentResponse {
    commentId: string;
    blogId: string;
    userId: string;
    content: string;
    authorName: string;
    createdAt: Date;
    updatedAt: Date;
}
