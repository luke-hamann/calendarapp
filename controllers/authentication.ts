import { Router } from "jsr:@oak/oak";
import nunjucks from "npm:nunjucks";
import User from "../models/user.ts";
import CalendarDatabase from "../models/calendarDatabase.ts";

const router = new Router();

router.get("/login/", (ctx) => {
  if (ctx.state.user) ctx.response.redirect("/");
  ctx.response.body = nunjucks.render("./views/authentication/login.html");
});

router.post("/login/", async (ctx) => {
  if (ctx.state.user) ctx.response.redirect("/");
  const form = await ctx.request.body.form();
  const username = form.get("name") ?? "";
  const password = form.get("password") ?? "";
  const user = new User(0, username, password);

  if (!user.isValid()) {
    ctx.response.body = nunjucks.render("./views/authentication/login.html", {
      user,
      errors: user.getErrors(),
    });
    return;
  }

  user.id = await CalendarDatabase.getUserId(user);

  if (user.id == 0) {
    ctx.response.body = nunjucks.render("./views/authentication/login.html", {
      user,
      errors: ["Invalid credentials."],
    });
    return;
  }

  ctx.state.user = user;
  ctx.response.redirect("/");
});

router.post("/logout/", (ctx) => {
  ctx.state.user = null;
  ctx.response.redirect("/");
});

export default router;
