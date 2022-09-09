import ytdl from "ytdl-core";
import axios from "axios";
import { Readable } from "stream";
import { YoutubeVideoSearchResultItem } from "./youtube/types";

export class YoutubeService {
  private static options: ytdl.downloadOptions = {
    filter: "audioonly",
    dlChunkSize: 0,
    highWaterMark: 1 << 25,
  };

  public static async handleQuery(query: string): Promise<Readable> {
    return ytdl.validateURL(query)
      ? await this.playSongByURL(query)
      : await this.getSongStreamByQuery(query);
  }

  public static async playSongByURL(url: string): Promise<Readable> {
    return await ytdl(url, this.options);
  }

  public static async getSongStreamByQuery(query: string): Promise<Readable> {
    const url = this.createRequestUrl(query);

    try {
      const { data } = await axios.get(url);
      const items: YoutubeVideoSearchResultItem[] = data.items;

      if (items[0]) {
        return await this.getStream(
          `https://www.youtube.com/watch?v=${items[0].id.videoId}`
        );
      }

      throw new Error("Failed to find anything by your query");
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  private static createRequestUrl = (query: string, maxResults = 20) =>
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${query}&type=video&key=${process.env.YOUTUBE_API_KEY}`;

  private static async getStream(url: string): Promise<Readable> {
    if (ytdl.validateURL(url)) return await ytdl(url, this.options);
    else throw new Error("Failed to get video stream");
  }
}
