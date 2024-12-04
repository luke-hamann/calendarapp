import sql from "./_database.ts";
import Subscription from "../entities/subscription.ts";

interface SubscriptionRow {
  id: number;
  type: string;
  target: string;
  secretToken: string;
}

export default abstract class SubscriptionDatabase {
  public static async addSubscription(
    subscription: Subscription,
  ): Promise<void> {
    const rows = await sql`
      SELECT *
      FROM Subscriptions
      WHERE type = ${subscription.type} AND
        target = ${subscription.target}
    `;
    if (rows.length > 0) return;

    await sql`
      INSERT INTO Subscriptions (type, target, secretToken)
      VALUES (
        ${subscription.type},
        ${subscription.target},
        ${subscription.secretToken}
      )
    `;
  }

  public static async getSubscriptionByToken(
    token: string,
  ): Promise<Subscription> {
    const rows = await sql`
      SELECT *
      FROM Subscriptions
      WHERE secretToken = ${token}
    ` as SubscriptionRow[];

    if (rows.length == 0) throw new Error("Subscription not found.");

    return new Subscription(
      rows[0].id,
      rows[0].type,
      rows[0].target,
      rows[0].secretToken,
    );
  }

  public static async deleteSubscription(
    subscription: Subscription,
  ): Promise<void> {
    await sql`
      DELETE FROM Subscriptions
      WHERE id = ${subscription.id}
    `;
  }
}
