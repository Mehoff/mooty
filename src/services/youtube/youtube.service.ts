import ytdl from "ytdl-core";
import axios from "axios";
import { Readable } from "stream";
import { YoutubeVideoSearchResultItem } from "./types";
import { CacheType, ChatInputCommandInteraction } from "discord.js";
import {
  ServiceErrorResponse,
  ServiceResponse,
} from "../../classes/service-response";

export class YoutubeService {
  private static options: ytdl.downloadOptions = {
    filter: "audioonly",
    dlChunkSize: 0,
    highWaterMark: 1 << 25,
  };

  public static async handleQuery(
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<ServiceResponse<Readable>> {
    const query = interaction.options.getString("query");
    if (!query)
      return new ServiceErrorResponse<Readable>("Bad query, try again");

    try {
      if (ytdl.validateURL(query)) {
        const data: Readable = await this.getSongStreamByURL(query);
        return new ServiceResponse<Readable>(data);
      } else {
        const data: Readable = await this.getSongStreamByQuery(query);
        return new ServiceResponse<Readable>(data);
      }
    } catch (err) {
      console.error(err);
      return new ServiceErrorResponse<Readable>(
        "Failed to get youtube audio stream"
      );
    }
  }

  public static async getSongStreamByURL(url: string) {
    return await ytdl(url, this.options);
  }

  public static async getSongStreamByQuery(query: string) {
    const url = this.createRequestUrl(query);

    const { data } = await axios.get(encodeURI(url));
    const items: YoutubeVideoSearchResultItem[] = data.items;

    if (items[0]) {
      return await this.getStream(
        `https://www.youtube.com/watch?v=${items[0].id.videoId}`
      );
    } else throw new Error("Youtube API did not respond");
  }

  private static async getStream(url: string): Promise<Readable> {
    return await ytdl(url, this.options);
  }

  private static createRequestUrl = (query: string, maxResults = 20) =>
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${query}&type=video&key=${process.env.YOUTUBE_API_KEY}`;
}
