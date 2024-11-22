import { connect } from "https://deno.land/x/amqp@v0.24.0/mod.ts";
import IMessage from "../models/message.ts";
import CalendarDatabase from "../../models/calendarDatabase.ts";

async function handler(message: IMessage): Promise<void> {
  const url: string = message.subscriptionurl;
  const webhookContent: string = JSON.stringify({
    content: message.eventdescription,
  });

  // console.log(webhookContent);
  // await Promise.resolve();
  // return;

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: webhookContent,
  })
  .then(async (response) => {
    if (response.status == 401) {
      await CalendarDatabase.deleteSubscriptionByUrl(url);
    }
  });
}

// deno-lint-ignore no-var
var running: boolean = true;
// deno-lint-ignore no-unused-vars
const onmessage = (signal: boolean) => running = signal;

const connection = await connect();
const channel = await connection.openChannel();
const queueName = "discord";
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
