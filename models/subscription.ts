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
      const buffer = new BigUint64Array(4);
      crypto.getRandomValues(buffer);
      this.secretToken = [...buffer].map(i => i.toString(16)).join("");
    } else {
      this.secretToken = secretToken;
    }
  }
}
