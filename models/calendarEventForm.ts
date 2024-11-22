import CalendarEvent from "./calendarEvent.ts";

export default class CalendarEventForm {
  id: number = 0;
  datetime: string = "";
  time: string = "";
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
    form.datetime = calendarEvent.timestamp.toISOString().slice(0, 19);
    form.description = calendarEvent.description;
    form.broadcast = calendarEvent.broadcast;
    return form;
  }

  public getErrors(): string[] {
    const errors: string[] = [];
    if (this.datetime == "") {
      errors.push("Date/time is required.");
    }
    if (errors.length == 0) {
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
