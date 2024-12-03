export default class Subscription {
  id: number;
  type: string;
  url: string;
  secretToken: string;

  constructor(id: number, type: string, url: string, secretToken: string | undefined = undefined) {
    this.id = id;
    this.type = type;
    this.url = url;

    if (secretToken == undefined) {
      this.secretToken = crypto.randomUUID();
    } else {
      this.secretToken = secretToken;
    }
  }
}
