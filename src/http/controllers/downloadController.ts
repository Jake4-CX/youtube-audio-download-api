import logger from "@/utils/logger";
import { NextFunction, Request, Response } from "express";
import { getVideoIdFromURL, getVideoInfo } from "@/utils/youtube";
import { ytDlp } from "@/utils/ytdlp";
import path = require("path");
import { createUploadStream } from "@/utils/s3";

export class DownloadController {

  async downloadAudio(request: Request, response: Response, next: NextFunction) {
    const { videoURL } = request.body as { videoURL: string };
    const { } = request;

    const ytDlpWrap = ytDlp;

    const videoId = getVideoIdFromURL(videoURL);

    if (!videoId) {
      return response.status(400).json({ message: "Invalid video URL" });
    }

    const data = await getVideoInfo(videoId);

    if (!data) {
      return response.status(404).json({ message: "Video not found" });
    }

    const outputPath = "downloads/" + data.snippet.title + ".mp3";
    const filePath = path.resolve(outputPath);

    // S3
    const fileName = data.snippet.title;
    const { pass, promise } = createUploadStream(fileName, "audio/mpeg");

    const ytDlpStream = ytDlpWrap.execStream([
      videoURL,
      '-f', 'bestaudio',
      '--extract-audio',
      '--audio-format', 'mp3',
      '-o', '-' // Output to stdout
    ]);

    ytDlpStream.pipe(pass); // Pipe download stream into S3 upload stream

    ytDlpStream.on('error', (err) => {
      logger.error("yt-dlp error: " + err);
      response.status(500).json({ message: "Download error", error: err });
    });

    await promise; // Wait for upload completion

    logger.info("Upload finished");
    response.json({ message: "Upload successful", fileName });

    response.json({ data });
  }

}