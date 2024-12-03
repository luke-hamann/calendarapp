import sql from "./_database.ts";
import User from "../entities/user.ts";

interface UserRow {
  id: number;
  name: string;
}

export default abstract class UserDatabase {
  public static async getUser(id: number): Promise<User> {
    const rows = await sql`
      SELECT id, name
      FROM Administrators
      WHERE id = ${id}
    ` as UserRow[];

    if (rows.length == 0) throw new Error("That user does not exist.");

    return new User(rows[0].id, rows[0].name, "");
  }

  public static async getUserId(user: User): Promise<number> {
    const rows = await sql`
      SELECT id, name
      FROM Administrators
      WHERE name = ${user.name} AND
        password = ${user.password}
    ` as UserRow[];

    if (rows.length == 0) return 0;

    return rows[0].id;
  }
}
