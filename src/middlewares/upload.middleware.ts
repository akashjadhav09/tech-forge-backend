// Middleware for file upload like image, pdf and others
import fs from "fs";
import path from "path";
import multer from "multer";
import type { StorageEngine, FileFilterCallback } from "multer";
import type { Request } from "express";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Ensures a directory exists; creates it recursively if it doesn't. */
function ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// ─── Storage Factory ──────────────────────────────────────────────────────────

/**
 * Creates a multer DiskStorage that saves files to the given destination.
 * Files are renamed to: <fieldname>-<timestamp>-<random><ext>
 */
function createDiskStorage(destination: string): StorageEngine {
    return multer.diskStorage({
        destination: (_req, _file, cb) => {
            ensureDir(destination);
            cb(null, destination);
        },
        filename: (_req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const ext = path.extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
    });
}

// ─── File Filters ─────────────────────────────────────────────────────────────

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const imageFileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
): void => {
    if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed (jpeg, png, webp, gif)."));
    }
};

// ─── Upload Paths ─────────────────────────────────────────────────────────────

const AVATARS_DIR = path.join(process.cwd(), "public", "assets", "avatars");
const BLOGS_DIR   = path.join(process.cwd(), "public", "assets", "blogs");

// ─── Multer Instances ─────────────────────────────────────────────────────────

/**
 * Upload middleware for user profile images.
 * Destination : public/assets/avatars
 * Field name  : "profile-image"
 * Max size    : 2 MB
 */
export const uploadAvatar = multer({
    storage: createDiskStorage(AVATARS_DIR),
    fileFilter: imageFileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
}).single("profile-image");

/**
 * Upload middleware for a single blog image.
 * Destination : public/assets/blogs
 * Field name  : "blog-image"
 * Max size    : 5 MB
 */
export const uploadBlogImage = multer({
    storage: createDiskStorage(BLOGS_DIR),
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single("blog-image");

/**
 * Upload middleware for multiple blog images (up to 10).
 * Destination : public/assets/blogs
 * Field name  : "blog-images"
 * Max size    : 5 MB per file
 */
export const uploadBlogImages = multer({
    storage: createDiskStorage(BLOGS_DIR),
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
}).array("blog-images", 10);