import Message from "../../models/message.ts";
import Consumer from "../../models/consumer.ts";
import CalendarDatabase from "../../models/calendarDatabase.ts";

async function handler(message: Message): Promise<void> {
  const url = message.subscriptionUrl;
  const title = message.eventDescription;
  const date = message.eventTimestamp.toLocaleString();
  const description = `${date}\n\n[View in calendar](http://localhost:8080/)`;

  const webhookContent = JSON.stringify({
    content: null,
    embeds: [{ title, description }],
  });

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: webhookContent
  })
    .then(async (response) => {
      if (response.status == 401) {
        await CalendarDatabase.deleteSubscriptionByUrl(url);
      }
    });
}

const consumer = new Consumer("discord", handler);
await consumer.run();
