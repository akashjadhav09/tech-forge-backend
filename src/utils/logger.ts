import fs from "fs";
import path from "path";
import type { Application } from "express";
import morgan from "morgan";

const logDir = path.join(process.cwd(), "logs");
const logFilePath = path.join(logDir, "access.log");

fs.mkdirSync(logDir, { recursive: true });

const accessLogStream = fs.createWriteStream(logFilePath, {
  flags: "a",
});

export function setupHttpLogging(app: Application): void {
  app.use(
    morgan("combined", {
      stream: accessLogStream,
    })
  );
}
