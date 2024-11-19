import nunjucks from "npm:nunjucks";
import CalendarEvent from "./models/calendarEvent.ts";
import CalendarDatabase from "./models/calendarDatabase.ts";

Deno.serve(async (_request: Request) => {
  const calendarEvents: CalendarEvent[] = await CalendarDatabase.getEvents(2024);
  return new Response(nunjucks.render("./views/list.html", { calendarEvents }))!;
});
