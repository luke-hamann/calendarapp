import IMessage from "../models/message.ts";
import Consumer from "../models/consumer.ts";

function handler(message: IMessage): Promise<void> {
  console.log(`emailed ${message.subscriptionurl} ${message.eventdescription}`);
  return Promise.resolve();
}

const consumer = new Consumer("email", handler);
await consumer.run();
