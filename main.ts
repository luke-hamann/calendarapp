import { Application, Router } from "jsr:@oak/oak";
import nunjucks from "npm:nunjucks";
import CalendarEvent from "./models/calendarEvent.ts";
import CalendarDatabase from "./models/calendarDatabase.ts";
import Subscription from "./models/subscription.ts";
import User from "./models/user.ts";

/* Workers */

new Worker(import.meta.resolve("./workers/producer.ts"), { type: "module" });
new Worker(import.meta.resolve("./workers/consumer.ts"), { type: "module"});

/* Web frontend */

const router = new Router();

router.get("/", async (ctx) => {
  const calendarEvents: CalendarEvent[] = await CalendarDatabase.getEvents();
  ctx.response.body = nunjucks.render("./views/list.html", { calendarEvents });
});

router.get("/subscribe/", (ctx) => {
  ctx.response.body = nunjucks.render("./views/subscribe.html");
});

router.post("/subscribe/", async (ctx) => {
  const form = await ctx.request.body.form();
  const target = form.get("target") ?? "";
  const discordPattern = new RegExp(/^https:\/\/discord\.com\/api\/webhooks\/\d{19}\/[\w\d-]{68}$/);

  let type: string;
  if (discordPattern.test(target)) {
    type = "discord";
  } else {
    ctx.response.body = nunjucks.render("./views/subscribe.html", {
      error: "Invalid subscription"
    });
    return;
  }

  const subscription: Subscription = new Subscription(0, type, target);
  await CalendarDatabase.addSubscription(subscription);
  ctx.response.body = nunjucks.render("./views/subscribeSuccess.html");
});

router.get("/login/", (ctx) => {
  ctx.response.body = nunjucks.render("./views/login.html");
})

router.post("/login/", async (ctx) => {
  const form = await ctx.request.body.form();
  const username = form.get("name") ?? "";
  const password = form.get("password") ?? "";
  const user = new User(0, username, password);

  if (!user.isValid()) {
    ctx.response.body = nunjucks.render("./views/login.html", {
      user, errors: user.getErrors()
    });
    return;
  }

  const isValidLogin = await CalendarDatabase.isValidLogin(user);

  if (!isValidLogin) {
    ctx.response.body = nunjucks.render("./views/login.html", {
      user, errors: ["Invalid credentials."]
    });
    return;
  }

  ctx.response.redirect("/");
})

router.post("/logout/", (ctx) => {

});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());
app.listen({ port: 8080 });
