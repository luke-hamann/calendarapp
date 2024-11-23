import { Context, Next } from "jsr:@oak/oak";
import User from "../models/user.ts";
import CalendarDatabase from "../models/calendarDatabase.ts";

export default async (ctx: Context, next: Next) => {
  const cookieValue = await ctx.cookies.get("userId");
  const userId = cookieValue === undefined ? 0 : Number(cookieValue);
  let user: User | null;
  try {
    user = await CalendarDatabase.getUser(userId);
  } catch {
    user = null;
  }
  ctx.state.user = user;

  await next();

  if (ctx.state.user == null) ctx.cookies.delete("userId");
  else ctx.cookies.set("userId", ctx.state.user!.id.toString());
};
