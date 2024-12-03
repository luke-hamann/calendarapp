import { Context, Next } from "jsr:@oak/oak";

export default async (context: Context, next: Next) => {
  try {
    await context.send({
      root: `${Deno.cwd()}/static`,
    });
  } catch {
    await next();
  }
};
