import { Router } from "jsr:@oak/oak";
import { connect } from "https://deno.land/x/amqp@v0.24.0/mod.ts";
import Message from "../models/entities/message.ts";

const router = new Router();

router.get("/notifications/", async (ctx) => {
  const target = await ctx.sendEvents();
  const connection = await connect();
  const channel = await connection.openChannel();

  await channel.declareQueue({ exclusive: true });
  await channel.declareExchange({
    exchange: "pushExchange",
    type: "fanout",
    durable: false,
  });
  await channel.bindQueue({ exchange: "pushExchange" });

  let running = true;
  target.addEventListener("close", () => {
    running = false;
  });

  while (running) {
    await channel.consume({}, (_args, _props, data) => {
      const json = JSON.parse(new TextDecoder().decode(data));
      const message = Message.fromJSON(json);
      target.dispatchMessage(
        `${message.eventDescription} (${message.eventTimestamp.toLocaleString()})`,
      );
    });
  }

  await connection.close();
});

export default router;
