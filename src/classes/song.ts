export class Song {
  public title: string;
  public thumbnailUrl: string;
  public url: string;
  public requestedBy?: string;

  constructor(
    title: string,
    thumbnailUrl: string,
    url: string,
    requestedBy: string = "Anonymous"
  ) {
    this.url = url;
    this.thumbnailUrl = thumbnailUrl;
    this.title = title;
    this.requestedBy = requestedBy;
  }
}
