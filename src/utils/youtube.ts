import axios from "axios";
import logger from "./logger";

export async function getVideoInfo(videoId: string) {

  const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`);

  if (response.status === 200) {

    type ImageThumbnail = {
      height: number,
      width: number,
      url: string
    }

    const data = response.data as {
      etag: string,
      kind: string,
      items: {
        id: string,
        etag: string,
        kind: string,
        statistics: {
          favoriteCount: number,
          likeCount: number,
          viewCount: number
        },
        snippet: {
          categoryId: string,
          channelId: string,
          title: string
          description: string,
          liveBroadcastContent: string,
          localized: {
            title: string,
            description: string
          },
          publishedAt: string,
          thumbnails: {
            default: ImageThumbnail,
            high: ImageThumbnail,
            maxres: ImageThumbnail,
            medium: ImageThumbnail,
            standard: ImageThumbnail
          }
        }
      }[],
      pageInfo: {
        totalResults: number,
        resultsPerPage: number
      }
    }

    if (data.items.length === 0) {
      logger.error(`No video found with id: ${videoId}`);
      return null;
    }

    return data.items[0];
  }

  logger.error(`Failed to get video '${videoId}' info with status: ${response.status}`);

  return null;
}

export function getVideoIdFromURL(url: string) {
  // Regex, return null if the URL is not a valid youtube video URL (youtube.com or youtu.be)
  if (!/(youtube.com|youtu.be)/.test(url)) {
    return null;
  }

  const videoId = url.split('v=')[1];
  return videoId;
}