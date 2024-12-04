import sql from "./_database.ts";
import Message from "../entities/message.ts";

interface MessageRow {
  eventid: number;
  eventdescription: string;
  eventtimestamp: string;
  eventbroadcast: boolean;
  subscriptionid: number;
  subscriptiontype: string;
  subscriptiontarget: string;
  subscriptionsecrettoken: string;
}

export default abstract class MessageDatabase {
  public static async *getUnpublishedMessages(
    date: Date,
  ): AsyncGenerator<Message> {
    const epoch = Math.round(date.getTime() / 1000);
    const query = sql`
      SELECT
        Events.id eventId,
        Events.description eventDescription,
        Events.timestamp eventTimestamp,
        Events.broadcast eventBroadcast,
        Subscriptions.id subscriptionId,
        Subscriptions.type subscriptionType,
        Subscriptions.target subscriptionTarget,
        Subscriptions.secretToken subscriptionSecretToken
      FROM Events, Subscriptions
      WHERE extract(epoch from Events.timestamp) <= ${epoch} AND
        Events.broadcast = true
      UNION
      SELECT
        Events.id eventId,
        Events.description eventDescription,
        Events.timestamp eventTimestamp,
        Events.broadcast eventBroadcast,
        0 subscriptionId,
        'push' subscriptionType,
        '' subscriptionTarget,
        '' subscriptionSecretToken
      FROM Events
      WHERE extract(epoch from Events.timestamp) <= ${epoch} AND
        Events.broadcast = true
    `;

    const cursor = query.cursor();
    for await (const [row] of cursor as AsyncIterable<MessageRow[]>) {
      yield new Message(
        row.eventid,
        row.eventdescription,
        new Date(row.eventtimestamp + " UTC"),
        row.eventbroadcast,
        row.subscriptionid,
        row.subscriptiontype,
        row.subscriptiontarget,
        row.subscriptionsecrettoken,
      );
    }
  }
}
