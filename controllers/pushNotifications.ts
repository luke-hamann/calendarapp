import { Router } from "jsr:@oak/oak";

const pushWorker = new Worker(import.meta.resolve('../workers/consumers/push.ts'), {
  type: "module"
});

const router = new Router();

router.get("/notifications/", async (ctx) => {
  const target = await ctx.sendEvents();
  pushWorker.onmessage = (e) => {
    target.dispatchMessage(e.data);
  }
});

export default router;
