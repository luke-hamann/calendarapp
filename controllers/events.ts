import { Router } from "jsr:@oak/oak";
import nunjucks from "npm:nunjucks";
import CalendarEvent from "../models/calendarEvent.ts";
import CalendarEventForm from "../models/calendarEventForm.ts";
import CalendarDatabase from "../models/calendarDatabase.ts";

const router = new Router();

router.get("/add/", (ctx) => {
  if (ctx.state.user == null) ctx.response.redirect("/login/");

  ctx.response.body = nunjucks.render("./views/events/edit.html", {
    title: "Add Event", action: "/add/", currentUser: ctx.state.user
  });
});

router.post("/add/", async (ctx) => {
  if (ctx.state.user == null) ctx.response.redirect("/login/");

  const params: URLSearchParams = await ctx.request.body.form();
  const calendarEventForm = CalendarEventForm.fromParams(params);

  if (!calendarEventForm.isValid()) {
    ctx.response.body = nunjucks.render("./views/events/edit.html", {
      title: "Add Event", action: "/add/", calendarEventForm, currentUser: ctx.state.user
    });
    return;
  }

  const calendarEvent = calendarEventForm.getCalendarEvent();
  await CalendarDatabase.addEvent(calendarEvent);
  ctx.response.redirect(`/${calendarEvent.timestamp.getUTCFullYear()}/`);
});

router.get("/edit/:id/", async (ctx) => {
  if (ctx.state.user == null) ctx.response.redirect("/login/");

  const id = Number(ctx.params.id);

  let calendarEvent: CalendarEvent;
  try {
    calendarEvent = await CalendarDatabase.getEvent(id);
  } catch {
    return;
  }

  const calendarEventForm = CalendarEventForm.fromCalendarEvent(calendarEvent);

  ctx.response.body = nunjucks.render("./views/events/edit.html", {
    title: "Edit Event", calendarEventForm, action: `/edit/${id}/`, currentUser: ctx.state.user
  })
})

router.post("/edit/:id/", async (ctx) => {
  if (ctx.state.user == null) ctx.response.redirect("/login/");

  const id = Number(ctx.params.id ?? 0);

  try {
    await CalendarDatabase.getEvent(id);
  } catch {
    return;
  }

  const params = await ctx.request.body.form();
  const calendarEventForm = CalendarEventForm.fromParams(params);
  
  if (!calendarEventForm.isValid()) {
    ctx.response.body = nunjucks.render("./views/events/edit.html", {
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
  if (ctx.state.user == null) ctx.response.redirect("/login/");

  const id = Number(ctx.params.id);

  let calendarEvent: CalendarEvent;
  try {
    calendarEvent = await CalendarDatabase.getEvent(id);
  } catch {
    return;
  }

  ctx.response.body = nunjucks.render("./views/events/delete.html", {
    calendarEvent, currentUser: ctx.state.user
  });
})

router.post("/delete/:id/", async (ctx) => {
  if (ctx.state.user == null) ctx.response.redirect("/login/");

  const id = Number(ctx.params.id);

  let calendarEvent: CalendarEvent;
  try {
    calendarEvent = await CalendarDatabase.getEvent(id);
  } catch {
    return;
  }
  const year = calendarEvent.timestamp.getUTCFullYear();
  await CalendarDatabase.deleteEvent(calendarEvent);
  ctx.response.redirect(`/${year}/`);
});

export default router;
