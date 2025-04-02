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
  "ultrafast", // Faster encoding
  "-tune",
  "zerolatency", // Optimize for low latency
  "-g",
  "15", // Reduced GOP size
  "-sc_threshold",
  "0",
  "-bufsize",
  "2000k",
  "-maxrate",
  "2000k",
  "-f",
  "hls",
  "-hls_time",
  "1", // Reduced segment time
  "-hls_list_size",
  "2", // Keep fewer segments
  "-hls_flags",
  "delete_segments+append_list+omit_endlist", // Optimize for low latency
  "-hls_segment_type",
  "mpegts",
  "-hls_init_time",
  "1",
  "-hls_segment_filename",
  path.join(hlsDir, "segment_%d.ts"),
  path.join(hlsDir, "stream.m3u8"),
]);

ffmpeg.stdout.on("data", (data) => {
  // console.log(`FFmpeg stdout: ${data}`);
});

ffmpeg.stderr.on("data", (data) => {
  // console.error(`FFmpeg stderr: ${data}`);
});

ffmpeg.on("close", (code) => {
  console.log(`FFmpeg process exited with code ${code}`);
});

// Handle process termination
process.on("SIGINT", () => {
  ffmpeg.kill("SIGINT");
  process.exit();
});
