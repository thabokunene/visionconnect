import { createServer } from "vite";
import { createApplicationApp } from "../server/app.js";
// Development only. Production runs the API separately behind the site's HTTPS proxy.
if (process.env.NODE_ENV === "production")
  throw new Error("Use npm run server for production API hosting.");
const app = await createApplicationApp();
const api = app.listen(3001, "0.0.0.0");
await new Promise((resolve, reject) => {
  api.once("listening", resolve);
  api.once("error", reject);
});
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const vite = await createServer({
  server: {
    port: portIndex >= 0 ? Number(args[portIndex + 1]) : 5173,
    strictPort: true,
  },
});
await vite.listen();
vite.printUrls();
console.log("Application API on 3001 · TEST DATA ONLY");
async function stop() {
  await vite.close();
  api.close(() => process.exit(0));
}
process.once("SIGTERM", stop);
process.once("SIGINT", stop);
