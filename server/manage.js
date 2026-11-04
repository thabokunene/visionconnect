// Host-only operations. There is intentionally no unauthenticated web download/list endpoint.
import { readdir, readFile, open, unlink, mkdir, stat } from "node:fs/promises";
import { resolve, join, isAbsolute, dirname } from "node:path";
import { userInfo } from "node:os";
import { decryptBundle } from "./app.js";
const [command, reference, ...args] = process.argv.slice(2);
const test = process.argv.includes("--test");
const root = resolve(
  process.env.APPLICATION_DATA_DIR || "../.citizen-application-data",
);
let key = process.env.APPLICATION_ENCRYPTION_KEY;
if (test && !key) key = await readFile(join(root, ".test-key"), "utf8");
if (!/^[a-f\d]{64}$/i.test(key || ""))
  throw new Error(
    "Provide the encryption key through the host's secret environment. Use --test only for local fictional data.",
  );
if (!["list", "export", "delete", "purge"].includes(command))
  throw new Error(
    "Usage: node server/manage.js list | export REFERENCE --output /private/file.json | delete REFERENCE --confirm | purge --confirm [--test]",
  );
const secret = Buffer.from(key, "hex");
async function audit(action, ref) {
  const handle = await open(join(root, ".operations.jsonl"), "a", 0o600);
  try {
    await handle.writeFile(
      JSON.stringify({
        at: new Date().toISOString(),
        operator: userInfo().username,
        action,
        reference: ref,
      }) + "\n",
    );
    await handle.sync();
  } finally {
    await handle.close();
  }
}
const days = Number(process.env.APPLICATION_RETENTION_DAYS);
const enquiryDays = Number(process.env.ENQUIRY_RETENTION_DAYS);
const validDays = (value) => Number.isInteger(value) && value >= 1;
if (
  command === "purge" &&
  ((!validDays(days) && !validDays(enquiryDays)) ||
    !process.argv.includes("--confirm"))
)
  throw new Error(
    "Purging requires an approved APPLICATION_RETENTION_DAYS or ENQUIRY_RETENTION_DAYS policy and --confirm. No retention period is assumed.",
  );
if (
  ["export", "delete"].includes(command) &&
  !/^(?:CHC|ENQ)-[A-F0-9]{12}$/.test(reference || "")
)
  throw new Error("Supply a complete server-issued reference.");
if (command === "delete" && !args.includes("--confirm"))
  throw new Error(
    "Deleting requires --confirm. This removes the local encrypted record, not backups or previous exports.",
  );
let matched = 0;
for (const name of await readdir(root)) {
  if (!/^[a-f\d]{64}\.enc$/.test(name)) continue;
  const path = join(root, name);
  const bundle = decryptBundle(await readFile(path), secret);
  const receipt = bundle.receipt;
  if (!test && receipt.mode === "test") continue;
  if (command === "list") {
    console.log(
      `${receipt.reference}\t${receipt.receivedAt}\t${receipt.mode}\t${bundle.kind || "driver-application"}\t${bundle.documents.length} document(s)`,
    );
    continue;
  }
  if (command !== "purge" && receipt.reference !== reference) continue;
  if (command === "purge") {
    const policyDays = bundle.kind === "employer-enquiry" ? enquiryDays : days;
    if (!validDays(policyDays)) {
      console.log(
        `Skipped ${receipt.reference}: no approved retention period for this record type.`,
      );
      continue;
    }
    if (Date.parse(receipt.receivedAt) > Date.now() - policyDays * 86400000)
      continue;
  }
  if (command === "export") {
    const output = args[args.indexOf("--output") + 1];
    if (!args.includes("--output") || !isAbsolute(output || ""))
      throw new Error(
        "Export requires --output and an absolute private JSON file path.",
      );
    if (resolve(output).startsWith(resolve(".") + "/"))
      throw new Error(
        "Do not export personal data into the website repository.",
      );
    await mkdir(dirname(output), { recursive: true, mode: 0o700 });
    if ((await stat(dirname(output))).mode & 0o077)
      throw new Error(
        "Export directory must be private (mode 0700). Choose a dedicated private directory.",
      );
    await audit("export-request", receipt.reference);
    const h = await open(output, "wx", 0o600);
    try {
      await h.writeFile(JSON.stringify(bundle, null, 2));
      await h.sync();
    } finally {
      await h.close();
    }
    console.log(
      "Exported to the private path. The JSON contains sensitive answers and base64 document bytes. Protect and delete it under the approved policy.",
    );
  } else {
    await audit(`${command}-request`, receipt.reference);
    await unlink(path);
    console.log(
      `Removed ${receipt.reference} from primary storage. Backups/exports require separate action.`,
    );
  }
  matched++;
}
if (command === "list") await audit("list", null);
else if (!matched) console.log("No matching records.");
