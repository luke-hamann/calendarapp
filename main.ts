import { Application } from "jsr:@oak/oak";
import User from "./models/entities/user.ts";
import authenticationRouter from "./controllers/authentication.ts";
import calendarRouter from "./controllers/calendar.ts";
import eventsRouter from "./controllers/events.ts";
import pushNotificationsRouter from "./controllers/pushNotifications.ts";
import subscriptionRouter from "./controllers/subscriptions.ts";
import sessionManager from "./middleware/sessionManager.ts";
import staticFiles from "./middleware/staticFiles.ts";

/* Start workers */

new Worker(import.meta.resolve("./workers/producer.ts"), { type: "module" });
new Worker(import.meta.resolve("./workers/consumers.ts"), { type: "module" });

/* Build app */

const app = new Application<{ user: User | null }>();

app.use(sessionManager);
app.use(authenticationRouter.routes());
app.use(calendarRouter.routes());
app.use(eventsRouter.routes());
app.use(pushNotificationsRouter.routes());
app.use(subscriptionRouter.routes());
app.use(staticFiles);

app.addEventListener("listen", () => {
  console.log("Listening...");
});

/* Run app */

app.listen({ port: 8080 });
