import ytdl from "ytdl-core";
import axios from "axios";
import { Readable } from "stream";
import {
  YoutubeVideoGetByURLItem,
  YoutubeVideoSearchResultItem,
} from "./interfaces";
import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { ServiceErrorResponse, ServiceResponse, Song } from "../../classes";

export class YoutubeService {
  private static options: ytdl.downloadOptions = {
    filter: "audioonly",
    dlChunkSize: 0,
    highWaterMark: 1 << 25,
    requestOptions:
      process.env.YOUTUBE_3PSID && process.env.YOUTUBE_3PAPISID
        ? {
            headers: {
              Cookie: `__Secure-3PSID=${process.env.YOUTUBE_3PSID};__Secure-3PAPISID=${process.env.YOUTUBE_3PAPISID}`,
            },
          }
        : undefined,
  };

  public static async handleQuery(
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<ServiceResponse<Song>> {
    let query = interaction.options.getString("query");
    if (!query) return new ServiceErrorResponse<Song>("Bad query, try again");

    query = query.trim();

    try {
      const song = ytdl.validateURL(query)
        ? await this.getSongByURL(query)
        : await this.getSongByQuery(query);

      return new ServiceResponse<Song>(song);
    } catch (err) {
      console.error(err);
      return new ServiceErrorResponse<Song>(
        "Failed to get youtube audio stream"
      );
    }
  }

  public static async getSongByURL(url: string): Promise<Song> {
    const id = ytdl.getURLVideoID(url);
    const reqUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${process.env.YOUTUBE_API_KEY}`;

    const response = await axios.get(encodeURI(reqUrl));

    if (!response.data) throw new Error("Failed to find song by URL");
    const items: YoutubeVideoGetByURLItem[] = response.data.items;
    return this.sanitizeSongByURLItem(items[0]);
  }

  public static async getSongByQuery(query: string): Promise<Song> {
    const url = this.createYoutubeVideoSearchRequestUrl(query);

    const { data } = await axios.get(encodeURI(url));
    const items: YoutubeVideoSearchResultItem[] = data.items;

    if (items[0]) return this.sanitizeSongFromVideoSearchResultItem(items[0]);
    else throw new Error("Youtube API did not respond");
  }

  public static async getReadable(url: string): Promise<Readable> {
    return await ytdl(url, this.options);
  }

  private static sanitizeSongFromVideoSearchResultItem(
    item: YoutubeVideoSearchResultItem
  ): Song {
    return {
      thumbnailUrl: item.snippet.thumbnails.default.url,
      title: item.snippet.title,
      url: this.getVideoUrlById(item.id.videoId),
    };
  }

  private static sanitizeSongByURLItem(item: YoutubeVideoGetByURLItem): Song {
    return {
      thumbnailUrl: item.snippet.thumbnails.default.url,
      title: item.snippet.title,
      url: this.getVideoUrlById(item.id),
    };
  }

  private static getVideoUrlById = (videoId: string) =>
    `https://www.youtube.com/watch?v=${videoId}`;

  private static createYoutubeVideoSearchRequestUrl = (
    query: string,
    maxResults = 20
  ) =>
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${query}&type=video&key=${process.env.YOUTUBE_API_KEY}`;
}
