import { Router } from "jsr:@oak/oak";
import nunjucks from "npm:nunjucks";
import Subscription from "../models/entities/subscription.ts";
import SubscriptionDatabase from "../models/databases/subscriptionDatabase.ts";

const router = new Router();

router.get("/subscribe/", (ctx) => {
  ctx.response.body = nunjucks.render("./views/subscriptions/subscribe.html", {
    currentUser: ctx.state.user,
  });
});

router.post("/subscribe/", async (ctx) => {
  const form = await ctx.request.body.form();

  const type = form.get("type") ?? "";
  if (!["email", "discord"].includes(type)) return;

  const target = form.get("target") ?? "";
  const emailPattern = new RegExp(/^[^\n]+@[^\n]+$/);
  const discordPattern = new RegExp(
    /^https:\/\/discord\.com\/api\/webhooks\/\d{19}\/[\w\d-]{68}$/,
  );

  let error;
  if (type == "email" && !emailPattern.test(target)) {
    error = "Invalid email address.";
  } else if (type == "discord" && !discordPattern.test(target)) {
    error = "Invalid Discord webhook.";
  }

  if (error) {
    ctx.response.body = nunjucks.render(
      "./views/subscriptions/subscribe.html",
      { error, currentUser: ctx.state.user },
    );
  }

  const subscription = new Subscription(0, type, target);
  if (type == "discord") {
    subscription.secretToken = target;
  }

  await SubscriptionDatabase.addSubscription(subscription);
  ctx.response.body = nunjucks.render(
    "./views/subscriptions/subscribeSuccess.html",
    { currentUser: ctx.state.user },
  );
});

router.get("/unsubscribe/", (ctx) => {
  const token = ctx.request.url.searchParams.get("token") ?? "";
  ctx.response.body = nunjucks.render(
    "./views/subscriptions/unsubscribe.html",
    { token, currentUser: ctx.state.user },
  );
});

router.post("/unsubscribe/", async (ctx) => {
  const form = await ctx.request.body.form();
  const token = form.get("token") ?? "";

  let subscription;
  try {
    subscription = await SubscriptionDatabase.getSubscriptionByToken(token);
  } catch {
    const errors = ["That subscription could not be found."];
    ctx.response.body = nunjucks.render(
      "./views/subscriptions/unsubscribe.html",
      { token, errors, currentUser: ctx.state.user },
    );
    return;
  }

  await SubscriptionDatabase.deleteSubscription(subscription);
  ctx.response.body = nunjucks.render(
    "./views/subscriptions/unsubscribeSuccess.html",
    { currentUser: ctx.state.user },
  );
});

export default router;
