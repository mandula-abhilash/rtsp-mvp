import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware to check if HLS directory exists
app.use("/hls", (req, res, next) => {
  const hlsDir = path.join(__dirname, "hls", "public");
  if (!fs.existsSync(hlsDir)) {
    fs.mkdirSync(hlsDir, { recursive: true });
  }
  next();
});

// Serve HLS files
app.use("/hls", express.static(path.join(__dirname, "hls", "public")));

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

// Health check endpoint
app.get("/health", (req, res) => {
  const hlsPath = path.join(__dirname, "hls", "public", "stream.m3u8");
  const streamExists = fs.existsSync(hlsPath);
  res.json({
    status: "ok",
    stream: streamExists ? "active" : "inactive",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(
    `📺 Stream available at http://localhost:${PORT}/hls/stream.m3u8`
  );
  console.log(
    `ℹ️  Remember to run 'npm run start-stream' in another terminal to start the FFmpeg process`
  );
});
