import { connect } from "https://deno.land/x/amqp@v0.24.0/mod.ts";
import IMessage from "../models/message.ts";

async function handler(message: IMessage): Promise<void> {
  console.log("push: " + message.eventdescription);
  (self as unknown as Worker).postMessage(message.eventdescription);
  await Promise.resolve();
  return;
}

// deno-lint-ignore no-var
var running: boolean = true;
// deno-lint-ignore no-unused-vars
const onmessage = (signal: boolean) => running = signal;

const connection = await connect();
const channel = await connection.openChannel();
const queueName = "push";
await channel.declareQueue({ queue: queueName });

while (running) {
  await channel.consume(
    { queue: queueName },
    async (args, _props, data) => {
      const json = JSON.parse(new TextDecoder().decode(data));
      await handler(json);
      await channel.ack({ deliveryTag: args.deliveryTag });
    },
  );
}