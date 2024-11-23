import IMessage from "../models/message.ts";
import Consumer from "../models/consumer.ts";

function handler(message: IMessage): Promise<void> {
  console.log("push: " + message.eventdescription);
  (self as unknown as Worker).postMessage(message.eventdescription);
  return Promise.resolve();
}

const consumer = new Consumer("push", handler);
await consumer.run();
