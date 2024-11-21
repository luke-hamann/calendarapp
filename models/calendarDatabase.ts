import sql from "./_db.ts";
import CalendarEvent from "./calendarEvent.ts";
import Subscription from "./subscription.ts";
import User from "./user.ts";

interface ICalendarEventRow {
  id: number;
  description: string;
  timestamp: Date;
  broadcasted: boolean;
}

export default abstract class CalendarDatabase {
  public static async getEvent(id: number): Promise<CalendarEvent> {
    const rows = await sql`
      SELECT id, description, timestamp, broadcasted
      FROM Events
      WHERE id = ${id}
    ` as {
      id: number,
      description: string,
      timestamp: string,
      broadcasted: string
    }[];

    if (rows.length == 0) throw new Error("Event does not exist");

    const row = rows[0];
    return new CalendarEvent(
      row['id'],
      row['description'],
      new Date(row['timestamp']),
      (row['broadcasted'] == 'true' ? true : false)
    );
  }

  public static async getEvents(
    year: number = 0,
    month: number = 0,
    day: number = 0,
  ): Promise<CalendarEvent[]> {
    const rows = await sql`
      SELECT id, description, timestamp, broadcasted
      FROM Events
      WHERE (${year} = 0 OR date_part('year', timestamp) = ${year}) AND
        (${month} = 0 OR date_part('month', timestamp) = ${month}) AND
        (${day} = 0 OR date_part('day', timestamp) = ${day})
      ORDER BY timestamp;
    ` as {
      id: number,
      description: string,
      timestamp: string,
      broadcasted: string
    }[];

    return rows.map((row) => new CalendarEvent(
      row['id'], row['description'], new Date(row['timestamp']), (row['broadcasted'] == 'true' ? true : false)
    ));
  }

  public static async addEvent(calendarEvent: CalendarEvent) : Promise<void> {
    await sql`
      INSERT INTO Events
        (description, timestamp, broadcasted)
      VALUES (
        ${calendarEvent.description},
        ${calendarEvent.timestamp},
        ${calendarEvent.broadcasted}
      )
    `;
  }

  public static async updateEvent(calendarEvent: CalendarEvent) : Promise<void> {
    await sql`
      UPDATE Events
      SET description = ${calendarEvent.description},
        timestamp = ${calendarEvent.timestamp},
        broadcasted = ${calendarEvent.broadcasted}
      WHERE id = ${calendarEvent.id}
    `;
  }

  public static async deleteEvent(calendarEvent: CalendarEvent) : Promise<void> {
    await sql`
      DELETE FROM Events
      WHERE id = ${calendarEvent.id}
    `;
  }

  public static async addSubscription(subscription: Subscription) : Promise<void> {
    const result = await sql`
      SELECT *
      FROM Subscriptions
      WHERE type = ${subscription.type} AND
        url = ${subscription.url}
    `;
    if (result.length > 0) return;

    await sql`
      INSERT INTO Subscriptions (type, url)
      VALUES (${subscription.type}, ${subscription.url})
    `;
  }

  public static async isValidLogin(user: User) : Promise<boolean> {
    const results = await sql`
      SELECT *
      FROM Administrators
      WHERE name = ${user.name} AND
        password = ${user.password}
    `;
    return (results.length > 0);
  }

  public static getUnpublishedMessages(timestamp: number) {
    return sql`
      SELECT
        Events.id eventId,
        Events.description eventDescription,
        Events.timestamp eventTimestamp,
        Events.broadcasted eventBroadcasted,
        Subscriptions.id subscriptionId,
        Subscriptions.type subscriptionType,
        Subscriptions.url subscriptionUrl
      FROM Events, Subscriptions
      WHERE Events.timestamp <= to_timestamp(${timestamp}) AND
        Events.broadcasted = false
    `;
  }

  public static async markEventsAsBroadcasted(timestamp: number): Promise<void> {
    await sql`
      UPDATE Events
      SET broadcasted = true
      WHERE broadcasted = false AND
        Events.timestamp <= to_timestamp(${timestamp})
    `;
  }

  public static async getMinMaxYears(): Promise<{min: number, max: number}> {
    const rows = await sql`
      SELECT (
        SELECT date_part('year', timestamp)
        FROM events
        order by timestamp
        limit 1
      ) min,
      (
        SELECT date_part('year', timestamp)
        FROM events
        order by timestamp DESC
        limit 1
      ) max;
    ` as {min: number, max: number}[];

    return {min: rows[0].min, max: rows[0].max};
  }
}
