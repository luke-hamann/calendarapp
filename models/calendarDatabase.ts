import sql from "./_db.ts";
import CalendarEvent from "./calendarEvent.ts";
import Message from "./message.ts";
import Subscription from "./subscription.ts";
import User from "./user.ts";

export default abstract class CalendarDatabase {
  // deno-lint-ignore no-explicit-any
  private static convertRowToEvent(row: any): CalendarEvent {
    return new CalendarEvent(
      row["id"],
      row["description"],
      new Date(row["timestamp"] + " UTC"),
      row["broadcast"]
    );
  }

  public static async getEvent(id: number): Promise<CalendarEvent> {
    const rows = await sql`
      SELECT id, description, timestamp, broadcast
      FROM Events
      WHERE id = ${id}
    `;

    if (rows.length == 0) throw new Error("Event does not exist");

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
      ORDER BY timestamp;
    `;

    return rows.map((row) => this.convertRowToEvent(row));
  }

  public static async getRecentPastEvents(
    maxCount: number,
  ): Promise<CalendarEvent[]> {
    const rows = await sql`
      SELECT id, description, timestamp, broadcast
      FROM events
      WHERE timestamp < NOW()
      ORDER BY timestamp DESC
      LIMIT ${maxCount};
    `;

    return rows.map((row) => this.convertRowToEvent(row));
  }

  public static async addEvent(calendarEvent: CalendarEvent): Promise<void> {
    await sql`
      INSERT INTO Events
        (description, timestamp, broadcast)
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

  public static async addSubscription(
    subscription: Subscription,
  ): Promise<void> {
    const result = await sql`
      SELECT *
      FROM Subscriptions
      WHERE type = ${subscription.type} AND
        url = ${subscription.url}
    `;
    if (result.length > 0) return;

    await sql`
      INSERT INTO Subscriptions (type, url, secretToken)
      VALUES (${subscription.type}, ${subscription.url}, ${subscription.secretToken})
    `;
  }

  public static async getSubscriptionByToken(
    token: string,
  ): Promise<Subscription> {
    const rows = await sql`
      SELECT *
      FROM Subscriptions
      WHERE secretToken = ${token}
    ` as { id: number; type: string; url: string; secretToken: string }[];

    if (rows.length == 0) throw new Error("Subscription not found.");

    return new Subscription(
      rows[0].id,
      rows[0].type,
      rows[0].url,
      rows[0].secretToken,
    );
  }

  public static async deleteSubscription(subscription: Subscription): Promise<void> {
    await sql`
      DELETE FROM Subscriptions
      WHERE id = ${subscription.id} OR
        url = ${subscription.url}
    `;
  }

  public static async getUser(id: number): Promise<User> {
    const rows = await sql`
      SELECT id, name
      FROM Administrators
      WHERE id = ${id}
    ` as { id: number; name: string }[];

    if (rows.length == 0) throw Error("User does not exist.");

    return new User(rows[0].id, rows[0].name, "");
  }

  public static async getUserId(user: User): Promise<number> {
    const rows = await sql`
      SELECT id
      FROM Administrators
      WHERE name = ${user.name} AND
        password = ${user.password}
    ` as { id: number }[];

    if (rows.length == 0) return 0;
    return rows[0].id;
  }

  public static async *getUnpublishedMessages(date: Date) {
    const seconds = Math.round(date.getTime() / 1000);
    const query = sql`
      SELECT
        Events.id eventId,
        Events.description eventDescription,
        Events.timestamp eventTimestamp,
        Events.broadcast eventBroadcast,
        Subscriptions.id subscriptionId,
        Subscriptions.type subscriptionType,
        Subscriptions.url subscriptionUrl,
        Subscriptions.secretToken subscriptionSecretToken
      FROM Events, Subscriptions
      WHERE Events.timestamp <= to_timestamp(${seconds}) AND
        Events.broadcast = true
      UNION
      SELECT
        Events.id eventId,
        Events.description eventDescription,
        Events.timestamp eventTimestamp,
        Events.broadcast eventBroadcast,
        0 subscriptionId,
        'push' subscriptionType,
        '' subscriptionUrl,
        '' subscriptionSecretToken
      FROM Events
      WHERE Events.timestamp <= to_timestamp(${seconds}) AND
        Events.broadcast = true
    `;

    const cursor = query.cursor();
    for await (const [row] of cursor) {
      yield new Message(
        row["eventid"],
        row["eventdescription"],
        row["eventtimestamp"],
        row["eventbroadcast"],
        row["subscriptionid"],
        row["subscriptiontype"],
        row["subscriptionurl"],
        row["subscriptionsecrettoken"]
      );
    }
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

  public static async getMinMaxYears(): Promise<{ min: number; max: number }> {
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
    ` as { min: number; max: number }[];

    return { min: rows[0].min, max: rows[0].max };
  }
}
