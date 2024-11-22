import sql from "./_db.ts";
import CalendarEvent from "./calendarEvent.ts";
import Subscription from "./subscription.ts";
import User from "./user.ts";

export default abstract class CalendarDatabase {
  public static async getEvent(id: number): Promise<CalendarEvent> {
    const rows = await sql`
      SELECT id, description, timestamp, broadcast
      FROM Events
      WHERE id = ${id}
    ` as {
      id: number,
      description: string,
      timestamp: string,
      broadcast: boolean
    }[];

    if (rows.length == 0) throw new Error("Event does not exist");

    const row = rows[0];
    return new CalendarEvent(
      row['id'],
      row['description'],
      new Date(row['timestamp']),
      row['broadcast']
    );
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
      ORDER BY timestamp;
    ` as {
      id: number,
      description: string,
      timestamp: string,
      broadcast: boolean
    }[];

    return rows.map((row) => new CalendarEvent(
      row['id'], row['description'], new Date(row['timestamp']), row['broadcast']
    ));
  }

  public static async addEvent(calendarEvent: CalendarEvent) : Promise<void> {
    await sql`
      INSERT INTO Events
        (description, timestamp, broadcast)
      VALUES (
        ${calendarEvent.description},
        ${calendarEvent.timestamp},
        ${calendarEvent.broadcast}
      )
    `;
  }

  public static async updateEvent(calendarEvent: CalendarEvent) : Promise<void> {
    await sql`
      UPDATE Events
      SET description = ${calendarEvent.description},
        timestamp = ${calendarEvent.timestamp},
        broadcast = ${calendarEvent.broadcast}
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

  public static async deleteSubscriptionByUrl(url: string): Promise<void> {
    await sql`
      DELETE FROM subscriptions
      WHERE url = ${url}
    `;
  }

  public static async getUser(id: number) : Promise<User> {
    const rows = await sql`
      SELECT id, name
      FROM Administrators
      WHERE id = ${id}
    ` as {id: number, name: string}[];

    if (rows.length == 0) throw Error("User does not exist.");

    return new User(rows[0].id, rows[0].name, '');
  }

  public static async getUserId(user: User) : Promise<number> {
    const rows = await sql`
      SELECT id
      FROM Administrators
      WHERE name = ${user.name} AND
        password = ${user.password}
    ` as {id: number}[];

    if (rows.length == 0) return 0;
    return rows[0].id;
  }

  public static getUnpublishedMessages(date: Date) {
    const seconds = Math.round(date.getTime() / 1000);
    return sql`
      SELECT
        Events.id eventId,
        Events.description eventDescription,
        Events.timestamp eventTimestamp,
        Events.broadcast eventBroadcast,
        Subscriptions.id subscriptionId,
        Subscriptions.type subscriptionType,
        Subscriptions.url subscriptionUrl
      FROM Events, Subscriptions
      WHERE Events.timestamp <= to_timestamp(${seconds}) AND
        Events.broadcast = true
    `;
  }

  public static async markEventsAsBroadcast(date: Date): Promise<void> {
    const seconds = Math.round(date.getTime() / 1000);
    await sql`
      UPDATE Events
      SET broadcast = false
      WHERE broadcast = true AND
        Events.timestamp <= to_timestamp(${seconds})
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
