import { Router, send } from "jsr:@oak/oak";

const router = new Router();

router.get("/css/main.css", async (ctx) => {
  await send(ctx, "./static/css/main.css");
});

router.get("/img/icon.png", async (ctx) => {
  await send(ctx, "./static/img/icon.png");
});

router.get("/js/pushNotifications.js", async (ctx) => {
  await send(ctx, "./static/js/pushNotifications.js");
});

export default router;
