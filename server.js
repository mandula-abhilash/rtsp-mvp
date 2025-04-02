import express from "express";
import dotenv from "dotenv";

import { createRtspStreamRouter } from "./rtspStreamModule.js";

dotenv.config();

const app = express();

console.log(process.env.RTSP_URL);
const rtspUrl = process.env.RTSP_URL;

app.use("/camera", createRtspStreamRouter({ rtspUrl }));

app.listen(3000, () => {
  console.log("✅ Stream available at http://localhost:3000/camera/stream");
});
