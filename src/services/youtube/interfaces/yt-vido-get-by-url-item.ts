import { YoutubeVideoSearchResultItemSnippet } from "./index";

export interface YoutubeVideoGetByURLItem {
  kind: string;
  etag: string;
  id: string;
  snippet: YoutubeVideoSearchResultItemSnippet;
}
