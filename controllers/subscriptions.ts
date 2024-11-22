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

  let type: string;
  if (discordPattern.test(target)) {
    type = "discord";
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
  ctx.response.body = nunjucks.render("./views/subscribeSuccess.html", {
    currentUser: ctx.state.user,
  });
});

export default router;
