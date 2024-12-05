import Consumer from "./_consumer.ts";
import Message from "../../models/entities/message.ts";
import Subscription from "../../models/entities/subscription.ts";
import SubscriptionDatabase from "../../models/databases/subscriptionDatabase.ts";

const EMAIL_ENABLED = Deno.env.get("EMAIL_ENABLED") == "true";

function escapeHTML(html: string): string {
  return html.replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

async function handler(message: Message): Promise<void> {
  const unsubscribeUrl = `${Deno.env.get("BASE_URL")}/unsubscribe/?token=${
    encodeURIComponent(message.subscriptionSecretToken)
  }`;

  const text = `${message.eventDescription}\n\n` +
    `${message.eventTimestamp.toLocaleString()}\n\n` +
    `Unsubscribe: ${unsubscribeUrl}\n\n`;

  const html = `
    <p>${escapeHTML(message.eventDescription)}</p>
    <p>${escapeHTML(message.eventTimestamp.toLocaleString())}</p>
    <p><a href="${unsubscribeUrl}">Unsubscribe</a></p>`;

  const payload = {
    From: Deno.env.get("EMAIL_USER"),
    To: message.subscriptionTarget,
    Subject: message.eventDescription,
    MessageStream: "broadcast",
    TextBody: text,
    HtmlBody: html,
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
