import Message from "../../models/message.ts";
import Consumer from "../../models/consumer.ts";

function handler(message: Message): Promise<void> {
  console.log(`emailed ${message.subscriptionUrl} ${message.eventDescription}`);
  return Promise.resolve();
}

const consumer = new Consumer("email", handler);
await consumer.run();
