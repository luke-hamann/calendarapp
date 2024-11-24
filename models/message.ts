export default class Message {
  eventId: number;
  eventDescription: string;
  eventTimestamp: Date;
  eventBroadcast: boolean;
  subscriptionId: number;
  subscriptionType: string;
  subscriptionUrl: string;

  constructor(
    eventId: number,
    eventDescription: string,
    eventTimestamp: Date,
    eventBroadcast: boolean,
    subscriptionId: number,
    subscriptionType: string,
    subscriptionUrl: string,
  ) {
    this.eventId = eventId;
    this.eventDescription = eventDescription;
    this.eventTimestamp = eventTimestamp;
    this.eventBroadcast = eventBroadcast;
    this.subscriptionId = subscriptionId;
    this.subscriptionType = subscriptionType;
    this.subscriptionUrl = subscriptionUrl;
  }

  static fromJSON(json: any) {
    return new Message(
      json["eventId"],
      json["eventDescription"],
      new Date(json["eventTimestamp"]),
      json["eventBroadcast"],
      json["subscriptionId"],
      json["subscriptionType"],
      json["subscriptionUrl"],
    );
  }
}
