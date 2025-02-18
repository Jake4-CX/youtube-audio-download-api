import { db } from "@/db.server";
import logger from "@/utils/logger";
import { createUploadStream } from "@/utils/s3";
import { parseISO8601Duration } from "@/utils/time";
import { getVideoIdFromURL, getVideoInfo, getVideoInfoFromTitle } from "@/utils/youtube";
import { ytDlp } from "@/utils/ytdlp";
import { Request, Response, NextFunction } from "express";
export class DownloadController {
  async downloadByURL(request: Request, response: Response, next: NextFunction) {
    try {
      const { videoURL } = request.body as { videoURL: string };

      const videoId = getVideoIdFromURL(videoURL);
      if (!videoId) {
        response.status(400).json({ status: "invalid_url", message: "Invalid video URL" });
        return;
      }

      if (!(await this.vetVideo(videoId, response))) return;

      await this.handleDownload(videoId, response);

    } catch (error) {
      logger.error("Download failed: " + error);
      response.status(500).json({ status: "error", message: "Internal server error", error });
      return;
    }
  }

  async downloadByTitle(request: Request, response: Response, next: NextFunction) {
    try {
      const { videoTitle } = request.body as { videoTitle: string };

      const videoDataFromTitle = await getVideoInfoFromTitle(videoTitle);
      if (!videoDataFromTitle) {
        response.status(404).json({ status: "not_found", message: "Video not found" });
        return;
      }

      const videoId = videoDataFromTitle.items[0].id.videoId;

      if (!(await this.vetVideo(videoId, response))) return;

      await this.handleDownload(videoId, response);

    } catch (error) {
      logger.error("Download failed: " + error);
      response.status(500).json({ status: "error", message: "Internal server error", error });
      return;
    }
  }

  private async vetVideo(videoId: string, response: Response) {
    if (await existingFile(videoId, response)) return false;

    // Fetch YouTube video details
    const videoData = await getVideoInfo(videoId);
    if (!videoData) {
      response.status(404).json({ status: "not_found", message: "Video not found" });
      return false;
    }

    if (videoData.statistics.viewCount < 5000) {
      response.status(400).json({ status: "below_minimum_view_count", message: "This video has less than 5000 views" });
      return false;
    }

    const contentRating = videoData.contentDetails.contentRating;
    if (contentRating && contentRating.ytRating === "ytAgeRestricted") {
      response.status(400).json({ status: "age_restricted", message: "This video is age restricted and cannot be downloaded." });
      return false;

    }

    const videoDuration = videoData.contentDetails.duration; // ISO 8601 string
    if ((parseISO8601Duration(videoDuration) / 60) >= 31) {
      response.status(400).json({ status: "duration_exceeded", message: "This video duration exceeds 30 minutes" });
      return false;
    }
    return true;
  }

  private async handleDownload(videoId: string, response: Response) {
    try {
      // Fetch YouTube video data
      const videoData = await getVideoInfo(videoId);

      // Generate file details
      const fileName = `${videoData.snippet.title}`;
      const thumbnail = videoData.snippet.thumbnails.default.url;
      const storedName = `${videoId}.mp3`;
      const r2Key = `audio/${storedName}`;
      const bucketName = process.env.BACKBLAZE_BUCKET_NAME!;
      const mimeType = "audio/mpeg";
      const fileExtension = ".mp3";

      // Create upload stream for BackBlaze R2
      const { pass, promise } = createUploadStream(r2Key, mimeType);
      const ytDlpStream = ytDlp.execStream([
        `https://www.youtube.com/watch?v=${videoId}`,
        "-f", "bestaudio",
        "--extract-audio",
        "--audio-format", "mp3",
        "-o", "-" // Output to stdout
      ]);

      ytDlpStream.pipe(pass);

      ytDlpStream.on("error", (err) => {
        logger.error("yt-dlp error: " + err);
        throw new Error("Download error");
      });

      await promise; // Wait for upload completion

      // Store file details in the database
      const audioFile = await db.audioFile.create({
        data: {
          videoId,
          fileName,
          fileThumbnail: thumbnail,
          storedName,
          r2Key,
          bucketName,
          mimeType,
          fileExtension,
          size: 0, // Maybe calculate size?
          createdAt: new Date(),
          updatedAt: new Date(),
          requestCount: 1
        }
      });

      logger.info("Upload finished");

      response.json({
        status: "success",
        message: "Upload successful",
        data: audioFile
      });
    } catch (error) {
      logger.error("Download processing failed: " + error);
      response.status(500).json({ status: "error", message: "Internal server error", error });
    }
  }
}

async function existingFile(videoId: string, response: Response) {
  const existingFile = await db.audioFile.findUnique({
    where: { videoId }
  });

  if (existingFile) {
    await db.audioFile.update({
      where: { id: existingFile.id },
      data: { requestCount: existingFile.requestCount + 1 }
    });

    response.json({
      status: "success",
      message: "Already downloaded",
      data: existingFile
    });

    return true;
  }

  return false;
}