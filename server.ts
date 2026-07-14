import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { setupHttpLogging } from "./src/utils/logger.ts";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 5000);

app.use(cors());
app.use(helmet());
app.use(express.json());
setupHttpLogging(app);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
