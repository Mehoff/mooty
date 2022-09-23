import { YoutubeVideoSearchResultItemThumbnail } from ".";

export interface YoutubeVideoSearchResultItemSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default: YoutubeVideoSearchResultItemThumbnail;
    medium: YoutubeVideoSearchResultItemThumbnail;
    high: YoutubeVideoSearchResultItemThumbnail;
  };
  channelTitle: string;
  liveBroadcastContent: string;
  publishTime: string;
}
