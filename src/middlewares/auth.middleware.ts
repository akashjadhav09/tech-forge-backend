import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware.ts";

interface JwtPayload {
    userId: string;
}

/**
 * Verifies the JWT access token from the Authorization header.
 * On success, sets req.user = { userId, email } for downstream handlers.
 * Throws 401 if the token is missing, malformed, or expired.
 */
export function authenticateToken(
    req: Request,
    _res: Response,
    next: NextFunction
): void {
    try {
        const authHeader = req.headers["authorization"];

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError(401, "Unauthorized: missing or malformed Authorization header.");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new AppError(401, "Unauthorized: token not provided.");
        }

        const secret = process.env.JWT_ACCESS_SECRET;
        if (!secret) {
            throw new AppError(500, "Server misconfiguration: JWT secret not set.");
        }

        const decoded = jwt.verify(token, secret) as JwtPayload;

        // Attach to request so controllers and services can access it
        req.user = {
            userId: decoded.userId,
            email: "",   // email is not stored in the access token payload
        };

        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
            return;
        }

        // Handle jwt-specific errors with a clean 401
        if (error instanceof jwt.TokenExpiredError) {
            next(new AppError(401, "Unauthorized: token has expired."));
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            next(new AppError(401, "Unauthorized: invalid token."));
            return;
        }

        next(error);
    }
}
