import sql from "./_database.ts";
import CalendarEvent from "../entities/calendarEvent.ts";

interface CalendarEventRow {
  id: number;
  description: string;
  timestamp: string;
  broadcast: boolean;
}

interface YearsRange {
  min: number;
  max: number;
}

export default abstract class EventDatabase {
  private static convertRowToEvent(row: CalendarEventRow): CalendarEvent {
    return new CalendarEvent(
      row.id,
      row.description,
      new Date(row.timestamp + " UTC"),
      row.broadcast,
    );
  }

  public static async getEvent(id: number): Promise<CalendarEvent> {
    const rows = await sql`
      SELECT id, description, timestamp, broadcast
      FROM Events
      WHERE id = ${id}
    ` as CalendarEventRow[];

    if (rows.length == 0) throw new Error("That event does not exist.");

    return this.convertRowToEvent(rows[0]);
  }

  public static async getEvents(
    year: number = 0,
    month: number = 0,
    day: number = 0,
  ): Promise<CalendarEvent[]> {
    const rows = await sql`
      SELECT id, description, timestamp, broadcast
      FROM Events
      WHERE (${year} = 0 OR date_part('year', timestamp) = ${year}) AND
        (${month} = 0 OR date_part('month', timestamp) = ${month}) AND
        (${day} = 0 OR date_part('day', timestamp) = ${day})
      ORDER BY timestamp
    ` as CalendarEventRow[];

    return rows.map((row) => this.convertRowToEvent(row));
  }

  public static async getRecentPastEvents(
    maxCount: number,
  ): Promise<CalendarEvent[]> {
    const rows = await sql`
      SELECT id, description, timestamp, broadcast
      FROM Events
      WHERE extract(epoch from timestamp) <= extract(epoch from NOW())
      ORDER BY timestamp DESC
      LIMIT ${maxCount};
    ` as CalendarEventRow[];

    return rows.map((row) => this.convertRowToEvent(row));
  }

  public static async addEvent(calendarEvent: CalendarEvent): Promise<void> {
    await sql`
      INSERT INTO Events (description, timestamp, broadcast)
      VALUES (
        ${calendarEvent.description},
        ${calendarEvent.timestamp.toISOString()},
        ${calendarEvent.broadcast}
      )
    `;
  }

  public static async updateEvent(calendarEvent: CalendarEvent): Promise<void> {
    await sql`
      UPDATE Events
      SET description = ${calendarEvent.description},
        timestamp = ${calendarEvent.timestamp.toISOString()},
        broadcast = ${calendarEvent.broadcast}
      WHERE id = ${calendarEvent.id}
    `;
  }

  public static async deleteEvent(calendarEvent: CalendarEvent): Promise<void> {
    await sql`
      DELETE FROM Events
      WHERE id = ${calendarEvent.id}
    `;
  }

  public static async setEventsAsBroadcast(
    eventIds: Set<number>,
  ): Promise<void> {
    for (const id of eventIds) {
      await sql`
        UPDATE Events
        SET broadcast = false
        WHERE id = ${id}
      `;
    }
  }

  public static async getYearsRange(): Promise<YearsRange> {
    const rows = await sql`
      SELECT (
        SELECT date_part('year', timestamp)
        FROM Events
        ORDER BY timestamp
        LIMIT 1
      ) min,
      (
        SELECT date_part('year', timestamp)
        FROM Events
        ORDER BY timestamp DESC
        LIMIT 1
      ) max;
    ` as YearsRange[];

    return { min: rows[0].min, max: rows[0].max };
  }
}
