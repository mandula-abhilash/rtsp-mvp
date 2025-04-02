// rtspStreamModule.js
import express from "express";
import { spawn } from "child_process";

export function createRtspStreamRouter({ route = "/stream", rtspUrl }) {
  const router = express.Router();

  router.get(route, (req, res) => {
    const ffmpeg = spawn("ffmpeg", [
      "-rtsp_transport",
      "tcp",
      "-i",
      rtspUrl,
      "-f",
      "mjpeg",
      "-q",
      "5",
      "pipe:1",
    ]);

    res.writeHead(200, {
      "Content-Type": "multipart/x-mixed-replace; boundary=ffserver",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    });

    ffmpeg.stdout.pipe(res);

    ffmpeg.stderr.on("data", (data) => {
      console.error("[FFmpeg error]", data.toString());
    });

    req.on("close", () => {
      ffmpeg.kill("SIGINT");
    });
  });

  return router;
}
