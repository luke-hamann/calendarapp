import Consumer from "../../models/consumer.ts";
import Message from "../../models/message.ts";
import Subscription from "../../models/subscription.ts";
import CalendarDatabase from "../../models/calendarDatabase.ts";

const EMAIL_ENABLED = Deno.env.get("EMAIL_ENABLED") == "true";

async function handler(message: Message): Promise<void> {
  const text =
    `${message.eventDescription}\n\n` +
    `${message.eventTimestamp}\n\n` +
    `Unsubscribe: ${Deno.env.get("BASE_URL")}/unsubscribe/?token=` +
    `${message.subscriptionSecretToken}\n\n`;
  
  const payload = {
    "From": Deno.env.get("EMAIL_USER"),
    "To": message.subscriptionUrl,
    "Subject": "[Coolander] " + message.eventDescription,
    "MessageStream": "broadcast",
    "TextBody": text
  };

  if (!EMAIL_ENABLED) {
    console.log(payload);
    return;
  }

  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": Deno.env.get("POSTMARK_SERVER_TOKEN")
    },
    body: JSON.stringify(payload)
  });

  if (response.status != 200) {
    await CalendarDatabase.deleteSubscription(
      new Subscription(0, message.subscriptionUrl, ''));
  }
}

const consumer = new Consumer("email", handler);
await consumer.run();
