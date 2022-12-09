import { PlaylistItem } from "./playlistItem";

interface PlaylistItemListResponsePageInfo {
  totalResults: number;
  resultsPerPage: number;
}

export interface PlaylistItemListResponse {
  kind: string;
  etag: string;
  items: PlaylistItem[];
  pageInfo: PlaylistItemListResponsePageInfo;
}
