import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

const sql = postgres({
  host: Deno.env.get("DATABASE_HOST"),
  port: Number(Deno.env.get("DATABASE_PORT")),
  database: Deno.env.get("DATABASE_NAME"),
  username: Deno.env.get("DATABASE_USER"),
  password: Deno.env.get("DATABASE_PASSWORD"),
});

export default sql;
