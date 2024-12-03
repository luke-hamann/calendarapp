import { Router } from "jsr:@oak/oak";
import nunjucks from "npm:nunjucks";
import EventDatabase from "../models/databases/eventDatabase.ts";

const router = new Router();

router.get("/", async (ctx) => {
  let year = new Date().getFullYear();
  const yearsRange = await EventDatabase.getYearsRange();
  year = Math.max(yearsRange.min, year);
  year = Math.min(yearsRange.max, year);
  ctx.response.redirect(`/${year}/`);
});

router.get("/index.rss", async (ctx) => {
  const calendarEvents = await EventDatabase.getRecentPastEvents(50);
  ctx.response.body = nunjucks.render("./views/calendar/index.rss", {
    title: Deno.env.get("APP_NAME"),
    base_url: Deno.env.get("BASE_URL"),
    calendarEvents,
  });
});

router.get("/:year/", async (ctx, next) => {
  const year = Number(ctx.params.year);
  const yearsRange = await EventDatabase.getYearsRange();

  if (isNaN(year) || year < yearsRange.min || year > yearsRange.max) {
    await next();
    return;
  }

  const calendarEvents = await EventDatabase.getEvents(year);
  ctx.response.body = nunjucks.render("./views/calendar/list.html", {
    calendarEvents,
    year,
    yearsRange,
    currentUser: ctx.state.user,
  });
});

export default router;
