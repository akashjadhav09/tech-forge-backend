// ─── Database Row Type ───────────────────────────────────────────────────────
export interface DislikeRow {
    dislike_id: string;
    blog_id: string;
    user_id: string;
    created_at: Date;
}

// ─── Response Types ───────────────────────────────────────────────────────────
export interface DislikeResponse {
    dislikeId: string;
    blogId: string;
    userId: string;
    createdAt: Date;
}

export interface DislikeCountResponse {
    blogId: string;
    dislikeCount: number;
    dislikedByCurrentUser: boolean;
}
