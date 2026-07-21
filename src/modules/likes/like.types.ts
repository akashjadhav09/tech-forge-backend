// ─── Database Row Type ───────────────────────────────────────────────────────
export interface LikeRow {
    like_id: string;
    blog_id: string;
    user_id: string;
    created_at: Date;
}

// ─── Response Types ───────────────────────────────────────────────────────────
export interface LikeResponse {
    likeId: string;
    blogId: string;
    userId: string;
    createdAt: Date;
}

export interface LikeCountResponse {
    blogId: string;
    likeCount: number;
    likedByCurrentUser: boolean;
}
