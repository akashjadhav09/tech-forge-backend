import dotenv from "dotenv";
dotenv.config();

import app from "./app.ts";

const port = Number(process.env.PORT ?? 5000);

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
