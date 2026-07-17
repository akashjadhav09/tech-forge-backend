import type { Request, Response, NextFunction } from "express";

// ── AppError ─────────────────────────────────────────────────────────────────
// Throw this anywhere in controllers/services to propagate a clean HTTP error.
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ── Global Error Handler ──────────────────────────────────────────────────────
// Must have 4 parameters for Express to recognise it as an error handler.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Unexpected / unhandled errors
  console.error("[Unhandled Error]", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
