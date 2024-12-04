import Consumer from "./_consumer.ts";
import Message from "../../models/entities/message.ts";
import Subscription from "../../models/entities/subscription.ts";
import SubscriptionDatabase from "../../models/databases/subscriptionDatabase.ts";

const EMAIL_ENABLED = Deno.env.get("EMAIL_ENABLED") == "true";

async function handler(message: Message): Promise<void> {
  const text =
    `${message.eventDescription}\n\n${message.eventTimestamp.toLocaleString()}\n\nUnsubscribe: ${
      Deno.env.get("BASE_URL")
    }/unsubscribe/?token=${message.subscriptionSecretToken}\n\n`;

  const payload = {
    From: Deno.env.get("EMAIL_USER"),
    To: message.subscriptionTarget,
    Subject: "[Coolander] " + message.eventDescription,
    MessageStream: "broadcast",
    TextBody: text,
  };

  if (!EMAIL_ENABLED) {
    console.log(payload);
    return;
  }

  let response;
  try {
    response = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": Deno.env.get("EMAIL_POSTMARK_SERVER_TOKEN"),
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.log(e);
  }

  if (response && response.status != 200) {
    await SubscriptionDatabase.deleteSubscription(
      new Subscription(message.subscriptionId, "", "", ""),
    );
  }
}

const consumer = new Consumer("email", handler);
await consumer.run();
