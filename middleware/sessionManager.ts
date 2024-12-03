import { Context, Next } from "jsr:@oak/oak";
import UserDatabase from "../models/databases/userDatabase.ts";

export default async (ctx: Context, next: Next) => {
  const kv = await Deno.openKv();

  // Initialize the session
  let sessionId = await ctx.cookies.get("sessionId");
  if (sessionId == undefined || (await kv.get([sessionId])).key == null) {
    sessionId = crypto.randomUUID();
    const expires = new Date(new Date().valueOf() + (1000 * 60 * 60));
    ctx.cookies.set("sessionId", sessionId, { expires });
    await kv.set([sessionId], 0);
  }

  // Attempt to authenticate the user
  const userId = (await kv.get([sessionId])).value as (number | null) ?? 0;
  try {
    ctx.state.user = await UserDatabase.getUser(userId);
  } catch {
    ctx.state.user = null;
  }
  const wasAuthenticated = ctx.state.user != null;

  // Pass through to the other controllers
  await next();

  // Logged out
  if (wasAuthenticated && ctx.state.user == null) {
    ctx.cookies.delete("sessionId");
    await kv.delete([sessionId]);

    // Logged in
  } else if (!wasAuthenticated && ctx.state.user != null) {
    await kv.set([sessionId], ctx.state.user!.id);
  }
};
