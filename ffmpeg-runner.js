import { spawn } from "child_process";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Ensure HLS directory exists
const hlsDir = path.join(process.cwd(), "hls", "public");
fs.mkdirSync(hlsDir, { recursive: true });

const rtspUrl = process.env.RTSP_URL;

if (!rtspUrl) {
  console.error("❌ RTSP_URL not found in environment variables");
  process.exit(1);
}

const ffmpeg = spawn("ffmpeg", [
  "-rtsp_transport",
  "tcp",
  "-i",
  rtspUrl,
  "-c:v",
  "libx264",
  "-preset",
  "veryfast",
  "-g",
  "25",
  "-sc_threshold",
  "0",
  "-f",
  "hls",
  "-hls_time",
  "2",
  "-hls_list_size",
  "3",
  "-hls_flags",
  "delete_segments",
  path.join(hlsDir, "stream.m3u8"),
]);

ffmpeg.stdout.on("data", (data) => {
  console.log(`FFmpeg stdout: ${data}`);
});

ffmpeg.stderr.on("data", (data) => {
  console.error(`FFmpeg stderr: ${data}`);
});

ffmpeg.on("close", (code) => {
  console.log(`FFmpeg process exited with code ${code}`);
});

// Handle process termination
process.on("SIGINT", () => {
  ffmpeg.kill("SIGINT");
  process.exit();
});
