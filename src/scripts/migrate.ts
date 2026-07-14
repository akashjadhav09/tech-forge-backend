// scripts/migrate.ts

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../config/db.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function findMigrationDirectory(): Promise<string> {
    const candidates = [
        path.resolve(__dirname, "..", "migrations"),
        path.resolve(process.cwd(), "src", "migrations"),
        path.resolve(process.cwd(), "migrations"),
    ];

    for (const candidate of candidates) {
        try {
            const stats = await fs.stat(candidate);
            if (stats.isDirectory()) {
                return candidate;
            }
        } catch {
            // Ignore and try the next candidate.
        }
    }

    throw new Error(`Migrations directory not found. Checked: ${candidates.join(", ")}`);
}

async function migrate() {
    try {
        console.log("Starting migrations...");

        // Create schema_migrations table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Read migration files
        const migrationPath = await findMigrationDirectory();

        const files = await fs.readdir(migrationPath);

        files.sort();

        for (const file of files) {

            // Check whether migration already executed
            const result = await pool.query(
                `SELECT * FROM schema_migrations WHERE filename = $1`,
                [file]
            );

            if (result.rows.length > 0) {
                console.log(`Skipping ${file}`);
                continue;
            }

            console.log(`Running ${file}`);

            const sql = await fs.readFile(
                path.join(migrationPath, file),
                "utf-8"
            );

            await pool.query(sql);

            await pool.query(
                `INSERT INTO schema_migrations(filename)
                 VALUES($1)`,
                [file]
            );

            console.log(`${file} completed`);
        }

        console.log("All migrations completed.");
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

migrate();