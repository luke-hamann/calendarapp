import postgres from "https://deno.land/x/postgresjs/mod.js";

const sql = postgres({
  host: "localhost",
  port: 5432,
  database: "calendarapp",
  username: "calendarapp",
  password: "password",
});

export default sql;
