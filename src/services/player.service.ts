import ytdl from "ytdl-core";

export class YTDLService {
  public static async handleQuery(query: string) {
    return ytdl.validateURL(query)
      ? await this.playSongByURL(query)
      : await this.playSongByQuery(query);
  }

  public static async playSongByURL(url: string) {
    const basicInfo = await ytdl.getBasicInfo(url);
    return basicInfo.videoDetails.title;
  }
  public static async playSongByQuery(query: string) {}
}
