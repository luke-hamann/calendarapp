import CalendarEvent from "../entities/calendarEvent.ts";

export default class CalendarEventForm {
  title: string = "";
  action: string = "";

  id: number = 0;
  datetime: string = "";
  description: string = "";
  broadcast: boolean = false;

  public static fromParams(params: URLSearchParams): CalendarEventForm {
    const form = new CalendarEventForm();
    form.datetime = params.get("datetime") ?? "";
    form.description = params.get("description") ?? "";
    form.broadcast = params.has("broadcast");
    return form;
  }

  public static fromCalendarEvent(
    calendarEvent: CalendarEvent,
  ): CalendarEventForm {
    const form = new CalendarEventForm();

    const t = calendarEvent.timestamp;
    const y = t.getFullYear();
    const m = (t.getMonth() + 1).toString().padStart(2, "0");
    const d = t.getDate().toString().padStart(2, "0");
    const h = t.getHours().toString().padStart(2, "0");
    const i = t.getMinutes().toString().padStart(2, "0");
    const s = t.getSeconds().toString().padStart(2, "0");
    form.datetime = `${y}-${m}-${d}T${h}:${i}:${s}`;

    form.description = calendarEvent.description;
    form.broadcast = calendarEvent.broadcast;
    return form;
  }

  public getErrors(): string[] {
    const errors = [];

    if (this.datetime == "") {
      errors.push("Date/time is required.");
    } else {
      try {
        new Date(this.datetime);
      } catch {
        errors.push("Invalid date.");
      }
    }

    if (this.description == "") {
      errors.push("Description is required.");
    }

    return errors;
  }

  public isValid(): boolean {
    return (this.getErrors().length == 0);
  }

  public getCalendarEvent(): CalendarEvent {
    return new CalendarEvent(
      0,
      this.description,
      new Date(this.datetime),
      this.broadcast,
    );
  }
}
