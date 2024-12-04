import { connect } from "https://deno.land/x/amqp@v0.24.0/mod.ts";
import EventDatabase from "../models/databases/eventDatabase.ts";
import MessageDatabase from "../models/databases/messageDatabase.ts";

// Set up the connection, channel, queues, and exchange
const connection = await connect();
const channel = await connection.openChannel();

const queues = ["discord", "email"];
for (const queue in queues) {
  await channel.declareQueue({ queue });
}

await channel.declareExchange({
  exchange: "pushExchange",
  type: "fanout",
  durable: false,
});

while (true) {
  const messages = MessageDatabase.getUnpublishedMessages(new Date());
  const promises: Promise<void>[] = [];
  const eventIds: Set<number> = new Set();

  for await (const message of messages) {
    // Route the message based on the subscription type
    let basicPublishArgs = {};
    if (queues.includes(message.subscriptionType)) {
      basicPublishArgs = { routingKey: message.subscriptionType };
    } else if (message.subscriptionType == "push") {
      basicPublishArgs = { exchange: "pushExchange" };
    }

    const data = new TextEncoder().encode(JSON.stringify(message));
    const promise = channel.publish(
      basicPublishArgs,
      { contentType: "application/json" },
      data,
    );

    eventIds.add(message.eventId);
    promises.push(promise);
  }

  promises.push(EventDatabase.setEventsAsBroadcast(eventIds));
  await Promise.all(promises);
}
