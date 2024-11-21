import CalendarEvent from "./calendarEvent.ts";

export default class CalendarEventForm {
  id: number = 0;
  date: string = '';
  time: string = '';
  description: string = '';
  broadcasted: boolean = false;

  public static fromParams(params: URLSearchParams) : CalendarEventForm {
    const form = new CalendarEventForm();
    form.date = params.get("date") ?? "";
    form.time = params.get("time") ?? "";
    form.description = params.get("description") ?? "";
    form.broadcasted = params.has("broadcasted");
    return form;
  }

  public static fromCalendarEvent(calendarEvent: CalendarEvent): CalendarEventForm {
    const form = new CalendarEventForm();
    form.date = calendarEvent.timestamp.toISOString().slice(0, 10);
    form.time = calendarEvent.timestamp.toISOString().slice(11, 19);
    form.description = calendarEvent.description;
    form.broadcasted = calendarEvent.broadcasted;
    return form;
  }

  public getErrors() : string[] {
    const errors: string[] = [];
    if (this.date == "") {
      errors.push("Date is required.");
    }
    if (this.time == "") {
      errors.push("Time is required.");
    }
    if (errors.length == 0) {
      try {
        new Date(`${this.date}T${this.time}`);
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

  public getCalendarEvent() : CalendarEvent {
    return new CalendarEvent(
      0,
      this.description,
      new Date(`${this.date}T${this.time}`),
      this.broadcasted
    );
  }
}
