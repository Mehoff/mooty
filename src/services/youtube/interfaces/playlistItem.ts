// {
//     "kind": "youtube#playlistItem",
//     "etag": etag,
//     "id": string,
//     "snippet": {
//       "publishedAt": datetime,
//       "channelId": string,
//       "title": string,
//       "description": string,
//       "thumbnails": {
//         (key): {
//           "url": string,
//           "width": unsigned integer,
//           "height": unsigned integer
//         }
//       },
//       "channelTitle": string,
//       "videoOwnerChannelTitle": string,
//       "videoOwnerChannelId": string,
//       "playlistId": string,
//       "position": unsigned integer,
//       "resourceId": {
//         "kind": string,
//         "videoId": string,
//       }
//     },
//     "contentDetails": {
//       "videoId": string,
//       "startAt": string,
//       "endAt": string,
//       "note": string,
//       "videoPublishedAt": datetime
//     },
//     "status": {
//       "privacyStatus": string
//     }
//   }

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
  thumbnails: PlaylistItemSnippetThumbnail[];
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
