import { connect } from "https://deno.land/x/amqp/mod.ts";
import CalendarDatabase from "../models/calendarDatabase.ts";

let running: boolean = true;
// deno-lint-ignore no-unused-vars
const onmessage = (msg: boolean) => running = msg;

// Setup the connection, channel, and queues
const queues: string[] = ["discord", "email"];
const connection = await connect();
const channel = await connection.openChannel();
for (const queue in queues) {
  await channel.declareQueue({ queue });
}

while (running) {
  const now = Date.now() / 1000;
  const sql = CalendarDatabase.getUnpublishedMessages(now);
  const cursor = sql.cursor();
  const promises: Promise<void>[] = [];
  for await (const [row] of cursor) {
    if (!queues.includes(row.subscriptiontype)) continue;
    const promise = channel.publish(
      { routingKey: row.subscriptionType },
      { contentType: "application/json" },
      new TextEncoder().encode(JSON.stringify(row))
    );
    promises.push(promise);
  }
  promises.push(CalendarDatabase.markEventsAsBroadcasted(now));
  await Promise.all(promises);
}

await connection.close();
