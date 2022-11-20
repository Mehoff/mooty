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
  // __Secure-1PSIDCC=AIKkIs2DlcsZNrvZ3VVoW92Lz7bLi0GbdA7X5iBSMFZxIFKkhUDwmaHffjR15NCjxQIoc7WqVfba
  // __Secure-3PSIDCC=AIKkIs1f0PlpRako0beAB_RcggFZcgoMudADHIrYWbxLoUPvyuY7E5Ml6bWf_LWfOSR8zZ2B_qQ

  // __Secure-1PSIDCC=AIKkIs2uCYzxOVLbG4yLo2HSUA_nQrjKocIPxgHxWMyj9ZnpgqpsBRgW3kkpk7G1zeYGc5rqTJEs;
  // __Secure-1PAPISID=DlQPDNi0IQzrxHxy/AVJE5osAh7z7LEuFM;
  // __Secure-1PSID=QQjqRHEmofliM6nrbtYf_QUyguAN0P5_Z_643lpmnn0QP7HX-Wxwai0i7ruPwYx7m_F6Hg.;
  // __Secure-3PSIDCC=AIKkIs0XvBQqx3bLJtpBVfwlK9HURZ3j0wv9TPRJfJNbFz8ecYpb31StEiGXLauVT3L42dugz6w

  // VISITOR_INFO1_LIVE=evfx6RgIiiI;
  // HSID=ADNvAfeACrZgEv8lo; SSID=ATmuRJwNskhJlRZ8-;
  // APISID=NQgTCxZtlwAeUO0R/AHYhBoPK4AwU3n9W5;
  // SAPISID=DlQPDNi0IQzrxHxy/AVJE5osAh7z7LEuFM;
  // YSC=y1dkvv-9nUw;
  // LOGIN_INFO=AFmmF2swRQIhAP2CLTqcT60YlkQpCUL6KgbvRefJE1F8Gh7HJzAtXH99AiB1Kl4yvaqacdzKWXquUMxkNI4RTjpmK_USTHB0HuAqWw:QUQ3MjNmeHl4dWVGRWtNbFNTLXgtRDIybFBDYllidUhyQjFfZE4wNkVEbVRBa3ZHOV9CcVFoaGtwT1R2ZVRSNVFYMVR0NTdoREpxY0ZhbEltc2VuaVlwNTJxelpBX0hoWGhKT0dBdkx6QXZWQ0RCTXY0clhUbzI2d1VRaXhRWVNzTTNHUzVmMEVUcTZ1SjRNWjVybE5RazhjdTJqYl9ocjJR;
  // SID=QQjqRHEmofliM6nrbtYf_QUyguAN0P5_Z_643lpmnn0QP7HXqrTNBcEshEi-kKkSZ08vDg.;
  // SIDCC=AIKkIs2Xyt3RjUzjcOe0wLOD9Gji-jwjiA0d4hZC5RlzQ8iTOR0G4wSv7wxyLiwG5evwikVanqWp;
  // PREF=tz=Europe.Kiev&f6=40000000&f5=30000&volume=2&library_tab_browse_id=FEmusic_liked_playlists&repeat=NONE&autoplay=true&has_user_changed_default_autoplay_mode=true&f7=100;
  // wide=0;
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
