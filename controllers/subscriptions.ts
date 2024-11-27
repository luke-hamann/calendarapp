import { Router } from "jsr:@oak/oak";
import nunjucks from "npm:nunjucks";
import Subscription from "../models/subscription.ts";
import CalendarDatabase from "../models/calendarDatabase.ts";

const router = new Router();

router.get("/subscribe/", (ctx) => {
  ctx.response.body = nunjucks.render("./views/subscriptions/subscribe.html", {
    currentUser: ctx.state.user,
  });
});

router.post("/subscribe/", async (ctx) => {
  const form = await ctx.request.body.form();
  const target = form.get("target") ?? "";
  const discordPattern = new RegExp(
    /^https:\/\/discord\.com\/api\/webhooks\/\d{19}\/[\w\d-]{68}$/,
  );
  const emailPattern = new RegExp(/^[^\n]+@[^\n]+$/);

  let type: string;
  if (discordPattern.test(target)) {
    type = "discord";
  } else if (emailPattern.test(target)) {
    type = "email";
  } else {
    ctx.response.body = nunjucks.render(
      "./views/subscriptions/subscribe.html",
      {
        error: "Invalid subscription",
      },
    );
    return;
  }

  const subscription: Subscription = new Subscription(0, type, target);
  await CalendarDatabase.addSubscription(subscription);
  ctx.response.body = nunjucks.render("./views/subscriptions/subscribeSuccess.html", {
    currentUser: ctx.state.user
  });
});

router.get("/unsubscribe/:token/", (ctx) => {
  try {
    CalendarDatabase.getSubscriptionByToken(ctx.params.token);
  } catch {
    return;
  }

  ctx.response.body = nunjucks.render(
    "./views/subscriptions/unsubscribe.html",
    {
      currentUser: ctx.state.user,
      token: ctx.params.token
    },
  );
});

router.post("/unsubscribe/:token/", async (ctx) => {
  try {
    await CalendarDatabase.getSubscriptionByToken(ctx.params.token);
  } catch {
    return;
  }

  await CalendarDatabase.deleteSubscriptionByToken(ctx.params.token);
  ctx.response.body = nunjucks.render(
    "./views/subscriptions/unsubscribeSuccess.html",
    {
      currentUser: ctx.state.user
    }
  );
})

export default router;
