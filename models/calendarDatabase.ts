import sql from "./_db.ts";
import CalendarEvent from "./calendarEvent.ts";

interface ICalendarEventRow {
    id: number,
    description: string,
    timestamp: Date,
    broadcasted: boolean
}

export default abstract class CalendarDatabase {
  public static async getEvents(
    year: number,
    month: number = 0,
    day: number = 0,
  ): Promise<CalendarEvent[]> {
    const rows: ICalendarEventRow[] = await sql`
      SELECT id, description, timestamp, broadcasted
      FROM Events
      WHERE (date_part('year', timestamp) = ${year}) AND
        (0 = ${month} OR date_part('month', timestamp) = ${month}) AND
        (0 = ${day} OR date_part('day', timestamp) = ${day})
      ORDER BY timestamp;
    `;

    console.log(rows);
    return rows;
  }
}
