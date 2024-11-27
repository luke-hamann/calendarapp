import nodemailer from "npm:nodemailer";
import Message from "../../models/message.ts";
import Consumer from "../../models/consumer.ts";

const EMAIL_ENABLED = Deno.env.get("EMAIL_ENABLED") == "true";

let transporter: any;
if (EMAIL_ENABLED) {
  transporter = nodemailer.createTransport({
    host: Deno.env.get("EMAIL_HOST"),
    port: Number(Deno.env.get("EMAIL_PORT")),
    secure: Deno.env.get("EMAIL_SECURE") == "true" ? true : false,
    auth: {
      user: Deno.env.get("EMAIL_USER"),
      pass: Deno.env.get("EMAIL_PASS"),
    },
  });
}

async function handler(message: Message): Promise<void> {
  const from = Deno.env.get("EMAIL_USER");
  const to = message.subscriptionUrl;
  const subject = message.eventDescription;
  const text = message.eventDescription + "\n\n" + message.eventTimestamp +
    `\n\nhttp://localhost:8080/unsubscribe?token=${message.subscriptionSecretToken}/`;
  
  const email = { from, to, subject, text };

  if (EMAIL_ENABLED) {
    await transporter.sendMail(email);
  } else {
    console.log(email);
  }
}

const consumer = new Consumer("email", handler);
await consumer.run();
