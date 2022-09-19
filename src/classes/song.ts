export class Song {
  public title: string;
  public thumbnailUrl: string;
  public url: string;

  constructor(title: string, thumbnailUrl: string, url: string) {
    this.url = url;
    this.thumbnailUrl = thumbnailUrl;
    this.title = title;
  }
}
