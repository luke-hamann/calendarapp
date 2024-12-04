interface MessageJSON {
  eventId: number;
  eventDescription: string;
  eventTimestamp: string;
  eventBroadcast: boolean;
  subscriptionId: number;
  subscriptionType: string;
  subscriptionTarget: string;
  subscriptionSecretToken: string;
}

export default class Message {
  eventId: number;
  eventDescription: string;
  eventTimestamp: Date;
  eventBroadcast: boolean;
  subscriptionId: number;
  subscriptionType: string;
  subscriptionTarget: string;
  subscriptionSecretToken: string;

  constructor(
    eventId: number,
    eventDescription: string,
    eventTimestamp: Date,
    eventBroadcast: boolean,
    subscriptionId: number,
    subscriptionType: string,
    subscriptionTarget: string,
    subscriptionSecretToken: string,
  ) {
    this.eventId = eventId;
    this.eventDescription = eventDescription;
    this.eventTimestamp = eventTimestamp;
    this.eventBroadcast = eventBroadcast;
    this.subscriptionId = subscriptionId;
    this.subscriptionType = subscriptionType;
    this.subscriptionTarget = subscriptionTarget;
    this.subscriptionSecretToken = subscriptionSecretToken;
  }

  static fromJSON(json: MessageJSON) {
    return new Message(
      json.eventId,
      json.eventDescription,
      new Date(json.eventTimestamp),
      json.eventBroadcast,
      json.subscriptionId,
      json.subscriptionType,
      json.subscriptionTarget,
      json.subscriptionSecretToken,
    );
  }
}
