import { connect } from "https://deno.land/x/amqp@v0.24.0/mod.ts";
import IMessage from "../models/message.ts";

function handler(message: IMessage): void {
  console.log("emailed" + message);
}

// deno-lint-ignore no-var
var running: boolean = true;
// deno-lint-ignore no-unused-vars
const onmessage = (signal: boolean) => running = signal;

const connection = await connect();
const channel = await connection.openChannel();
const queueName = "email";
await channel.declareQueue({ queue: queueName });

while (running) {
  await channel.consume(
    { queue: queueName },
    async (args, _props, data) => {
      const message: IMessage = JSON.parse(new TextDecoder().decode(data));
      handler(message);
      await channel.ack({ deliveryTag: args.deliveryTag });
    }
  );
}