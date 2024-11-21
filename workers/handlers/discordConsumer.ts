import { connect } from "https://deno.land/x/amqp@v0.24.0/mod.ts";
import IMessage from "../models/message.ts";


function discordHandler(message: IMessage): void {
  const url: string = message.subscriptionurl;
  const webhookContent: string = JSON.stringify({
    content: message.eventdescription
  });

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: webhookContent
  })
}

// deno-lint-ignore no-var
var running: boolean = true;
// deno-lint-ignore no-unused-vars
const onmessage = (signal: boolean) => running = signal;

const connection = await connect();
const channel = await connection.openChannel();
const queueName = "messages";
await channel.declareQueue({ queue: queueName });

while (running) {
  await channel.consume(
    { queue: queueName },
    async (args, _props, data) => {
      const json = JSON.parse(new TextDecoder().decode(data));
      if (json.subscriptiontype == "discord") discordHandler(json);
      await channel.ack({ deliveryTag: args.deliveryTag });
    }
  );
}
