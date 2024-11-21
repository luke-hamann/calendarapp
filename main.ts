import { Application, Router, send } from "jsr:@oak/oak";
import nunjucks from "npm:nunjucks";
import CalendarEvent from "./models/calendarEvent.ts";
import CalendarDatabase from "./models/calendarDatabase.ts";
import Subscription from "./models/subscription.ts";
import User from "./models/user.ts";
import CalendarEventForm from "./models/calendarEventForm.ts";

/* Workers */

new Worker(import.meta.resolve("./workers/producer.ts"), { type: "module" });
new Worker(import.meta.resolve("./workers/consumers.ts"), { type: "module"});

/* Web frontend router */

const router = new Router();

/* Calendar routes */

router.get("/", (ctx) => {
  const year = (new Date()).getUTCFullYear();
  ctx.response.redirect(`/${year}/`);
});

/* Calendar view */

router.get("/:year/", async (ctx, next) => {
  const year = Number(ctx.params.year);
  const yearsRange = await CalendarDatabase.getMinMaxYears();

  if (isNaN(year) || year < yearsRange.min || year > yearsRange.max) {
    next();
  }

  const calendarEvents: CalendarEvent[] = await CalendarDatabase.getEvents(year);
  ctx.response.body = nunjucks.render("./views/list.html", { calendarEvents, year, yearsRange });
});

/* Subscriptions */

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

/* Authentication */

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
  ctx.response.redirect("/");
});

/* Calendar CRUD */

router.get("/add/", (ctx) => {
  ctx.response.body = nunjucks.render("./views/edit.html", {
    title: "Add Event", action: "/add/"
  });
});

router.post("/add/", async (ctx) => {
  const params: URLSearchParams = await ctx.request.body.form();
  const calendarEventForm = CalendarEventForm.fromParams(params);

  if (!calendarEventForm.isValid()) {
    ctx.response.body = nunjucks.render("./views/edit.html", {
      title: "Add Event", action: "/add/", calendarEventForm
    });
    return;
  }

  const calendarEvent = calendarEventForm.getCalendarEvent();
  await CalendarDatabase.addEvent(calendarEvent);
  ctx.response.redirect(`/${calendarEvent.timestamp.getUTCFullYear()}/`);
});

router.get("/edit/:id/", async (ctx) => {
  const id = Number(ctx.params.id);

  let calendarEvent: CalendarEvent;
  try {
    calendarEvent = await CalendarDatabase.getEvent(id);
  } catch {
    return;
  }

  const calendarEventForm = CalendarEventForm.fromCalendarEvent(calendarEvent);

  ctx.response.body = nunjucks.render("./views/edit.html", {
    title: "Edit Event", calendarEventForm, action: `/edit/${id}/`
  })
})

router.post("/edit/:id/", async (ctx) => {
  const id = Number(ctx.params.id ?? 0);

  try {
    await CalendarDatabase.getEvent(id);
  } catch {
    return;
  }

  const params = await ctx.request.body.form();
  const calendarEventForm = CalendarEventForm.fromParams(params);
  
  if (!calendarEventForm.isValid()) {
    ctx.response.body = nunjucks.render("./views/edit.html", {
      title: "Edit Event",
      errors: calendarEventForm.getErrors(),
      calendarEventForm,
      action: `/edit/${id}/`
    });
  }

  const calendarEvent = calendarEventForm.getCalendarEvent();
  calendarEvent.id = id;
  CalendarDatabase.updateEvent(calendarEvent);
  ctx.response.redirect(`/${calendarEvent.timestamp.getUTCFullYear()}/`);
});

router.get("/delete/:id/", async (ctx) => {
  const id = Number(ctx.params.id);

  let calendarEvent: CalendarEvent;
  try {
    calendarEvent = await CalendarDatabase.getEvent(id);
  } catch {
    return;
  }

  ctx.response.body = nunjucks.render("./views/delete.html", {
    calendarEvent
  });
})

router.post("/delete/:id/", async (ctx) => {
  const id = Number(ctx.params.id);

  let calendarEvent: CalendarEvent;
  try {
    calendarEvent = await CalendarDatabase.getEvent(id);
  } catch {
    return;
  }

  await CalendarDatabase.deleteEvent(calendarEvent);
  ctx.response.redirect("/");
});

/* Static files */

router.get("/css/main.css", async(ctx) => {
  await send(ctx, './static/css/main.css');
})

/* Start app */

const app = new Application();
app.use(router.routes());
app.listen({ port: 8080 });
