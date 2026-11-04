import { createApplicationApp } from "./app.js";
const app = await createApplicationApp();
const port = Number(process.env.APPLICATION_PORT || 3001);
const server = app.listen(port, "0.0.0.0", () =>
  console.log(
    `Application intake listening on ${port} (${process.env.NODE_ENV === "production" ? "live" : "TEST DATA ONLY"})`,
  ),
);
server.requestTimeout = 120000;
server.headersTimeout = 15000;
