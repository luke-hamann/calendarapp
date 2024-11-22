import { connect } from "https://deno.land/x/amqp@v0.24.0/mod.ts";
import CalendarDatabase from "../models/calendarDatabase.ts";

let running: boolean = true;
// deno-lint-ignore no-unused-vars
const onmessage = (msg: boolean) => running = msg;

// Setup the connection, channel, and queues
const queues: string[] = ["discord", "email", "push"];
const connection = await connect();
const channel = await connection.openChannel();
for (const queue in queues) {
  await channel.declareQueue({ queue });
}

while (running) {
  const sql = CalendarDatabase.getUnpublishedMessages(new Date());
  const cursor = sql.cursor();
  const promises: Promise<void>[] = [];
  const eventIds: Set<number> = new Set();
  for await (const [row] of cursor) {
    if (!queues.includes(row.subscriptiontype)) continue;
    eventIds.add(row.eventid);
    const promise = channel.publish(
      { routingKey: row.subscriptiontype },
      { contentType: "application/json" },
      new TextEncoder().encode(JSON.stringify(row)),
    );
    promises.push(promise);
  }
  promises.push(CalendarDatabase.setEventsAsBroadcast(eventIds));
  await Promise.all(promises);
}

await connection.close();
