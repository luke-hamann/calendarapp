import { Application } from "jsr:@oak/oak";
import User from "./models/user.ts";
import authenticationRouter from "./controllers/authentication.ts";
import calendarRouter from "./controllers/calendar.ts";
import eventsRouter from "./controllers/events.ts";
import staticRouter from "./controllers/static.ts";
import subscriptionRouter from "./controllers/subscriptions.ts";
import CalendarDatabase from "./models/calendarDatabase.ts";

/* Start workers */

new Worker(import.meta.resolve("./workers/producer.ts"), { type: "module" });
new Worker(import.meta.resolve("./workers/consumers.ts"), { type: "module"});

/* Start app */

const app = new Application<{user: User | null}>();

app.use(async (ctx, next) => {
  const cookieValue = await ctx.cookies.get("userId");
  const userId = cookieValue === undefined ? 0 : Number(cookieValue);
  let user: User | null;
  try {
    user = await CalendarDatabase.getUser(userId);
  } catch {
    user = null;
  }
  ctx.state.user = user;

  await next();

  if (ctx.state.user == null) ctx.cookies.delete("userId");
  else ctx.cookies.set("userId", ctx.state.user!.id.toString());
});

app.use(authenticationRouter.routes());
app.use(calendarRouter.routes());
app.use(eventsRouter.routes());
app.use(staticRouter.routes());
app.use(subscriptionRouter.routes());

app.listen({ port: 8080 });
