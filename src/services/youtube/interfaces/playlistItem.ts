interface PlaylistItemSnippetThumbnail {
  url: string;
  width: number;
  height: number;
}

interface PlaylistItemContentDetails {
  videoId: string;
  startAt: string;
  endAt: string;
  note: string;
  videoPublishedAt: string;
}

interface PlaylistItemSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default: PlaylistItemSnippetThumbnail;
    medium: PlaylistItemSnippetThumbnail;
    high: PlaylistItemSnippetThumbnail;
    standart: PlaylistItemSnippetThumbnail;
    maxres: PlaylistItemSnippetThumbnail;
  };
  channelTitle: string;
  videoOwnerChannelTitle: string;
  videoOwnerChannelId: string;
  playlistId: string;
  position: number;
  resourceId: { kind: string; videoId: string };
}

export interface PlaylistItem {
  kind: string;
  etag: string;
  id: string;
  snippet: PlaylistItemSnippet;
  contentDetails: PlaylistItemContentDetails;
  status: { privacyStatus: string };
}
