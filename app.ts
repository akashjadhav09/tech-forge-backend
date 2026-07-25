import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { setupHttpLogging } from "./src/utils/logger.ts";
import { errorHandler } from "./src/middlewares/error.middleware.ts";

import { authRouter } from "./src/modules/auth/auth.routes.ts";
import { userRouter } from "./src/modules/users/user.routes.ts";
import { blogRouter } from "./src/modules/blogs/blog.routes.ts";
import { commentRouter } from "./src/modules/comments/comment.routes.ts";
import { likeRouter } from "./src/modules/likes/like.routes.ts";

const app = express();

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      "http://localhost:2000",
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// ── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));
app.use(helmet());
app.use(express.json());
// Serve uploaded files (avatars, blog images, etc.) as static assets
// e.g. GET http://localhost:5000/assets/blogs/<filename>
app.use("/assets", express.static(path.join(process.cwd(), "public", "assets")));
setupHttpLogging(app);


// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/blog", blogRouter);
// GET /api/v1/comments/:blogId and GET /api/v1/comments/user/:userId
app.use("/api/v1/comments", commentRouter);
// POST /api/v1/comment, PUT /api/v1/comment/:id, DELETE /api/v1/comment/:id
app.use("/api/v1/comment", commentRouter);
app.use("api/v1/likes", likeRouter);

// ── Global Error Handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

export default app;
