import Consumer from "../../models/consumer.ts";
import Message from "../../models/message.ts";
import Subscription from "../../models/subscription.ts";
import CalendarDatabase from "../../models/calendarDatabase.ts";

const DISCORD_ENABLED = Deno.env.get("DISCORD_ENABLED") == "true";

async function handler(message: Message): Promise<void> {
  const url = message.subscriptionUrl;

  const payload = {
    username: "Coolander",
    avatar_url: Deno.env.get("DISCORD_AVATAR_URL"),
    content: null,
    embeds: [{
      title: message.eventDescription,
      description: message.eventTimestamp.toLocaleString() + '\n\n' +
        `[View in calendar]` +
        `(${Deno.env.get("BASE_URL")}/${message.eventTimestamp.getUTCFullYear()}/)`
    }]
  };

  if (!DISCORD_ENABLED) {
    console.log(payload);
    return;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status == 401) {
    await CalendarDatabase.deleteSubscription(new Subscription(0, url, ''));
  }
}

const consumer = new Consumer("discord", handler);
await consumer.run();
