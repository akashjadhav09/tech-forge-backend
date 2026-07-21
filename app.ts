import express from "express";
import cors from "cors";
import helmet from "helmet";
import { setupHttpLogging } from "./src/utils/logger.ts";
import { errorHandler } from "./src/middlewares/error.middleware.ts";

import { authRouter } from "./src/modules/auth/auth.routes.ts";
import { userRouter } from "./src/modules/users/user.routes.ts";
import { blogRouter } from "./src/modules/blogs/blog.routes.ts";

const app = express();

// ── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(helmet());
app.use(express.json());
setupHttpLogging(app);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/blog", blogRouter);

// ── Global Error Handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

export default app;
