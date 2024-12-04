import { Router } from "jsr:@oak/oak";
import nunjucks from "npm:nunjucks";
import CalendarEventForm from "../models/forms/calendarEventForm.ts";
import EventDatabase from "../models/databases/eventDatabase.ts";

const router = new Router();

router.get("/add/", (ctx) => {
  if (ctx.state.user == null) ctx.response.redirect("/login/");

  const calendarEventForm = new CalendarEventForm();
  calendarEventForm.title = "Add Event";
  calendarEventForm.action = "/add/";

  ctx.response.body = nunjucks.render("./views/events/edit.html", {
    calendarEventForm,
    ignoreErrors: true,
    currentUser: ctx.state.user,
  });
});

router.post("/add/", async (ctx) => {
  if (ctx.state.user == null) ctx.response.redirect("/login/");

  const params = await ctx.request.body.form();
  const calendarEventForm = CalendarEventForm.fromParams(params);
  calendarEventForm.title = "Add Event";
  calendarEventForm.action = "/add/";

  if (!calendarEventForm.isValid()) {
    ctx.response.body = nunjucks.render("./views/events/edit.html", {
      calendarEventForm,
      currentUser: ctx.state.user,
    });
    return;
  }

  const calendarEvent = calendarEventForm.getCalendarEvent();
  await EventDatabase.addEvent(calendarEvent);
  ctx.response.redirect(`/${calendarEvent.timestamp.getFullYear()}/`);
});

router.get("/edit/:id/", async (ctx) => {
  if (ctx.state.user == null) ctx.response.redirect("/login/");

  const id = Number(ctx.params.id);
  if (isNaN(id)) return;

  let calendarEvent;
  try {
    calendarEvent = await EventDatabase.getEvent(id);
  } catch {
    return;
  }

  const calendarEventForm = CalendarEventForm.fromCalendarEvent(calendarEvent);
  calendarEventForm.title = "Edit Event";
  calendarEventForm.action = `/edit/${id}/`;

  ctx.response.body = nunjucks.render("./views/events/edit.html", {
    calendarEventForm,
    currentUser: ctx.state.user,
  });
});

router.post("/edit/:id/", async (ctx) => {
  if (ctx.state.user == null) ctx.response.redirect("/login/");

  const id = Number(ctx.params.id);
  if (isNaN(id)) return;

  try {
    await EventDatabase.getEvent(id);
  } catch {
    return;
  }

  const params = await ctx.request.body.form();
  const calendarEventForm = CalendarEventForm.fromParams(params);
  calendarEventForm.title = "Edit Event";
  calendarEventForm.action = `/edit/${id}/`;

  if (!calendarEventForm.isValid()) {
    ctx.response.body = nunjucks.render("./views/events/edit.html", {
      calendarEventForm,
      currentUser: ctx.state.user,
    });
  }

  const calendarEvent = calendarEventForm.getCalendarEvent();
  calendarEvent.id = id;
  await EventDatabase.updateEvent(calendarEvent);
  ctx.response.redirect(`/${calendarEvent.timestamp.getFullYear()}/`);
});

router.get("/delete/:id/", async (ctx) => {
  if (ctx.state.user == null) ctx.response.redirect("/login/");

  const id = Number(ctx.params.id);
  if (isNaN(id)) return;

  let calendarEvent;
  try {
    calendarEvent = await EventDatabase.getEvent(id);
  } catch {
    return;
  }

  ctx.response.body = nunjucks.render("./views/events/delete.html", {
    calendarEvent,
    currentUser: ctx.state.user,
  });
});

router.post("/delete/:id/", async (ctx) => {
  if (ctx.state.user == null) ctx.response.redirect("/login/");

  const id = Number(ctx.params.id);
  if (isNaN(id)) return;

  let calendarEvent;
  try {
    calendarEvent = await EventDatabase.getEvent(id);
  } catch {
    return;
  }

  await EventDatabase.deleteEvent(calendarEvent);
  ctx.response.redirect("/");
});

export default router;
