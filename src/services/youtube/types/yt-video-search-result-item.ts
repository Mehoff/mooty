import { YoutubeVideoSearchResultItemSnippet } from ".";

export interface YoutubeVideoSearchResultItem {
  kind: string;
  etag: string;
  id: { kind: string; videoId: string };
  snippet: YoutubeVideoSearchResultItemSnippet;
}
