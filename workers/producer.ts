import { connect } from "https://deno.land/x/amqp@v0.24.0/mod.ts";
import CalendarDatabase from "../models/calendarDatabase.ts";

let running: boolean = true;
// deno-lint-ignore no-unused-vars
const onmessage = (msg: boolean) => running = msg;

// Setup the connection, channel, queues, and exchange
const connection = await connect();
const channel = await connection.openChannel();

const queues: string[] = ["discord", "email"];
for (const queue in queues) {
  await channel.declareQueue({ queue });
}

await channel.declareExchange({
  exchange: "pushExchange", type: "fanout", durable: false
});

while (running) {
  const sql = CalendarDatabase.getUnpublishedMessages(new Date());
  const cursor = sql.cursor();
  const promises: Promise<void>[] = [];
  const eventIds: Set<number> = new Set();
  for await (const [row] of cursor) {
    let basicPublishArgs = {};
    if (queues.includes(row.subscriptiontype)) {
      basicPublishArgs = { routingKey: row.subscriptiontype };
    } else if (row.subscriptiontype == "push") {
      basicPublishArgs = { exchange: "pushExchange" };
    }

    const promise = channel.publish(
      basicPublishArgs,
      { contentType: "application/json" },
      new TextEncoder().encode(JSON.stringify(row))
    );

    eventIds.add(row.eventid);
    promises.push(promise);
  }
  promises.push(CalendarDatabase.setEventsAsBroadcast(eventIds));
  await Promise.all(promises);
}

await connection.close();
