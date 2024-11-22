import { Router } from "jsr:@oak/oak";
import nunjucks from "npm:nunjucks";
import CalendarEvent from "../models/calendarEvent.ts";
import CalendarDatabase from "../models/calendarDatabase.ts";

const router = new Router();

router.get("/", (ctx) => {
  const year = (new Date()).getUTCFullYear();
  ctx.response.redirect(`/${year}/`);
});

router.get("/:year/", async (ctx, next) => {
  const year = Number(ctx.params.year);
  const yearsRange = await CalendarDatabase.getMinMaxYears();

  if (isNaN(year)) {
    next();
    return;
  }

  if (year < yearsRange.min || year > yearsRange.max) return;

  const calendarEvents: CalendarEvent[] = await CalendarDatabase.getEvents(year);
  ctx.response.body = nunjucks.render("./views/calendar/list.html", {
    calendarEvents, year, yearsRange, "currentUser": ctx.state.user });
});

export default router;
