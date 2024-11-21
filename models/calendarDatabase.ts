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
  public static async getEvents(
    year: number = 0,
    month: number = 0,
    day: number = 0,
  ): Promise<CalendarEvent[]> {
    const rows: ICalendarEventRow[] = await sql`
      SELECT id, description, timestamp, broadcasted
      FROM Events
      WHERE (${year} = 0 OR date_part('year', timestamp) = ${year}) AND
        (${month} = 0 OR date_part('month', timestamp) = ${month}) AND
        (${day} = 0 OR date_part('day', timestamp) = ${day})
      ORDER BY timestamp;
    `;

    return rows;
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

  public static async deleteEvent(id: number) : Promise<void> {
    await sql`
      DELETE FROM Events
      WHERE id = ${id}
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
}
