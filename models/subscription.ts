export default class Subscription {
  id: number;
  type: string;
  url: string;

  constructor(id: number, type: string, url: string) {
    this.id = id;
    this.type = type;
    this.url = url;
  }
}
