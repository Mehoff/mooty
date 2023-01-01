import { PlaylistItem } from "./playlistItem";

interface PlaylistItemListResponsePageInfo {
  totalResults: number;
  resultsPerPage: number;
}

export interface PlaylistItemListResponse {
  kind: string;
  etag: string;
  nextPageToken: string;
  prevPageToken: string;
  pageInfo: PlaylistItemListResponsePageInfo;
  items: PlaylistItem[];
}
