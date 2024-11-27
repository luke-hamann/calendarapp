import Message from "../../models/message.ts";
import Consumer from "../../models/consumer.ts";
import CalendarDatabase from "../../models/calendarDatabase.ts";

const DISCORD_ENABLED = Deno.env.get("DISCORD_ENABLED") == "true";

async function handler(message: Message): Promise<void> {
  const url = message.subscriptionUrl;
  const title = message.eventDescription;
  const date = message.eventTimestamp.toLocaleString();
  const description = `${date}\n\n[View in calendar](http://localhost:8080/)`;

  const webhookContent = {
    content: null,
    embeds: [{ title, description }],
  };

  if (DISCORD_ENABLED) {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookContent),
    })
      .then(async (response) => {
        if (response.status == 401) {
          await CalendarDatabase.deleteSubscriptionByUrl(url);
        }
      });
  } else {
    console.log(webhookContent);
  }
}

const consumer = new Consumer("discord", handler);
await consumer.run();
