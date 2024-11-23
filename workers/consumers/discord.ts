import IMessage from "../models/message.ts";
import Consumer from "../models/consumer.ts";
import CalendarDatabase from "../../models/calendarDatabase.ts";

async function handler(message: IMessage): Promise<void> {
  const url: string = message.subscriptionurl;
  const webhookContent: string = JSON.stringify({
    content: message.eventdescription,
  });

  await fetch(url, {
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

const consumer = new Consumer("discord", handler);
await consumer.run();
