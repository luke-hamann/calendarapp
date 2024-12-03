export default class Subscription {
  id: number;
  type: string;
  target: string;
  secretToken: string;

  constructor(
    id: number,
    type: string,
    target: string,
    secretToken: string | undefined,
  ) {
    this.id = id;
    this.type = type;
    this.target = target;
    this.secretToken = secretToken ?? crypto.randomUUID();
  }
}
