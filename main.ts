import { Application } from "jsr:@oak/oak";
import User from "./models/user.ts";
import sessionManager from "./middleware/sessionManager.ts";
import authenticationRouter from "./controllers/authentication.ts";
import calendarRouter from "./controllers/calendar.ts";
import eventsRouter from "./controllers/events.ts";
import pushNotifications from "./controllers/pushNotifications.ts";
import staticRouter from "./controllers/static.ts";
import subscriptionRouter from "./controllers/subscriptions.ts";

/* Start workers */

new Worker(import.meta.resolve("./workers/producer.ts"), { type: "module" });
new Worker(import.meta.resolve("./workers/consumers.ts"), { type: "module" });

/* Start app */

const app = new Application<{ user: User | null }>();

app.use(sessionManager);
app.use(authenticationRouter.routes());
app.use(calendarRouter.routes());
app.use(eventsRouter.routes());
app.use(pushNotifications.routes());
app.use(staticRouter.routes());
app.use(subscriptionRouter.routes());

app.listen({ port: 8080 });
