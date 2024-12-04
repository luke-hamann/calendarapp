import Consumer from "./_consumer.ts";
import Message from "../../models/entities/message.ts";
import Subscription from "../../models/entities/subscription.ts";
import SubscriptionDatabase from "../../models/databases/subscriptionDatabase.ts";

const DISCORD_ENABLED = Deno.env.get("DISCORD_ENABLED") == "true";

async function handler(message: Message): Promise<void> {
  const url = message.subscriptionTarget;

  const payload = {
    username: Deno.env.get("APP_NAME"),
    avatar_url: Deno.env.get("DISCORD_AVATAR_URL"),
    content: null,
    embeds: [{
      title: message.eventDescription,
      description:
        `${message.eventTimestamp.toLocaleString()}\n\n[View in calendar](${
          Deno.env.get("BASE_URL")
        }/${message.eventTimestamp.getFullYear()}/)`,
    }],
  };

  if (!DISCORD_ENABLED) {
    console.log(payload);
    return;
  }

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.log(e);
  }

  if (response && response.status != 204) {
    await SubscriptionDatabase.deleteSubscription(
      new Subscription(message.subscriptionId, "", "", ""),
    );
  }
}

const consumer = new Consumer("discord", handler);
await consumer.run();
