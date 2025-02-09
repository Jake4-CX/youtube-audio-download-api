import axios from "axios";
import logger from "./logger";

type ImageThumbnail = {
  height: number,
  width: number,
  url: string
}

export async function getVideoInfo(videoId: string) {

  const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`);

  if (response.status === 200) {

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
        contentDetails: {
          duration: string // ISO 8601 string - PT1H1M1S. P - period, T - time, H - hours, M - minutes, S - seconds,
          dimension: string,
          definition: string,
          caption: string,
          licensedContent: boolean,
          regionRestriction: {
            blocked: string[]
          }
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

  if (url.includes('youtu.be')) {
    return url.split('/').pop();
  }

  const videoId = url.split('v=')[1];
  return videoId;
}

export async function getVideoInfoFromTitle(title: string) {
  const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/search`, {
    params: {
      part: "snippet",
      q: title,
      type: "video",
      safeSearch: "none", // strict or none
      maxResults: 1,
      key: process.env.YOUTUBE_API_KEY
    }
  });

  if (response.status !== 200) {
    logger.error(`Failed to get video info with title: ${title} with status: ${response.status}`);
    return null;
  }

  const data = response.data as {
    kind: string,
    etag: string,
    nextPageToken: string,
    regionCode: string,
    pageInfo: {
      totalResults: number,
      resultsPerPage: number
    },
    items: {
      id: {
        kind: string,
        videoId: string
      },
      etag: string,
      kind: string,
      snippet: {
        publishedAt: string,
        channelId: string,
        title: string,
        description: string,
        thumbnails: {
          default: ImageThumbnail,
          medium: ImageThumbnail,
          high: ImageThumbnail
        },
        channelTitle: string,
        liveBroadcastContent: string,
        publishTime: string
      }
    }[]
  }

  return data;
}