import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createApplicationApp, decryptBundle } from "./app.js";
import { validateEnquiry } from "../src/employer-schema.js";
const sample = {
  yourName: "Test Buyer",
  jobTitle: "Fleet manager",
  company: "Fictional Logistics",
  industry: "Transport & Logistics",
  email: "buyer@example.com",
  phone: "+27 11 451 9898",
  services: ["Driver recruitment", "External HR management"],
  description: "Fictional enquiry for staffing a sample distribution site.",
  timeline: "This month",
  consent: true,
};
const key = "b2".repeat(32);
let directory, server, origin;
before(async () => {
  directory = await mkdtemp(join(tmpdir(), "chc-enquiry-"));
  const app = await createApplicationApp({ directory, key, rateLimit: 100 });
  server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((r) => server.close(r));
  await rm(directory, { recursive: true, force: true });
});
const send = (data = sample, id = randomUUID(), from = origin) =>
  fetch(`${origin}/api/client-enquiry`, {
    method: "POST",
    headers: {
      Origin: from,
      "Content-Type": "application/json",
      "Idempotency-Key": id,
    },
    body: JSON.stringify(data),
  });
test("shared validation accepts multi-service/scoping and rejects malformed required fields and choices", () => {
  assert.deepEqual(validateEnquiry(sample).errors, {});
  assert.deepEqual(
    validateEnquiry({
      ...sample,
      industry: "",
      services: ["Not sure — help me scope it"],
    }).errors,
    {},
  );
  for (const invalid of [
    null,
    [],
    {},
    { ...sample, yourName: " " },
    { ...sample, email: "bad" },
    { ...sample, phone: "abc" },
    { ...sample, description: "too short" },
    { ...sample, description: "x".repeat(801) },
    { ...sample, services: [] },
    { ...sample, timeline: "Tomorrow" },
    { ...sample, consent: "true" },
  ])
    assert.ok(Object.keys(validateEnquiry(invalid).errors).length);
});
test("config is no-store and clearly test-only", async () => {
  const r = await fetch(`${origin}/api/client-enquiry/config`);
  assert.equal(r.headers.get("cache-control"), "no-store");
  assert.deepEqual(await r.json(), {
    mode: "test",
    accepting: true,
    noticeVersion: "draft-v1.2-test-only",
  });
});
test("actual encrypted record is durable before server receipt; retry returns same reference and changed content conflicts", async () => {
  const before = await readdir(directory);
  const id = randomUUID();
  const first = await send(
    { ...sample, pageSource: "forged", pageUrl: "https://evil.example" },
    id,
  );
  assert.equal(first.status, 201);
  const receipt = await first.json();
  assert.match(receipt.reference, /^ENQ-[A-F0-9]{12}$/);
  const names = (await readdir(directory)).filter((n) => !before.includes(n));
  assert.equal(names.length, 1);
  const encrypted = await readFile(join(directory, names[0]));
  assert.equal(encrypted.includes(Buffer.from(sample.email)), false);
  const stored = decryptBundle(encrypted, Buffer.from(key, "hex"));
  assert.equal(stored.kind, "employer-enquiry");
  assert.equal(stored.receipt.reference, receipt.reference);
  assert.deepEqual(stored.answers.services, sample.services);
  assert.equal(stored.answers.pageSource, "For Employers Landing");
  assert.equal(stored.answers.pageUrl, "https://www.citizenhc.co.za/employers");
  const retry = await send(sample, id);
  assert.equal(retry.status, 200);
  assert.deepEqual(await retry.json(), receipt);
  assert.equal((await send({ ...sample, company: "Changed" }, id)).status, 409);
});
test("server independently rejects missing groups/permission, long text, false choices and honeypot without storing", async () => {
  const before = await readdir(directory);
  for (const payload of [
    { ...sample, services: [], timeline: "", consent: false },
    { ...sample, services: ["bad service"] },
    { ...sample, description: "x".repeat(801) },
    { ...sample, hp: "bot" },
  ]) {
    const r = await send(payload);
    assert.equal(r.status, 422);
    assert.ok(Object.keys((await r.json()).errors).length);
  }
  assert.equal((await send(null)).status, 400);
  assert.deepEqual(await readdir(directory), before);
});
test("rejects foreign/missing origins, invalid request IDs, malformed/oversize JSON and unsupported types", async () => {
  assert.equal(
    (await send(sample, randomUUID(), "https://evil.example")).status,
    403,
  );
  assert.equal((await send(sample, "bad")).status, 400);
  const post = (body, headers) =>
    fetch(`${origin}/api/client-enquiry`, {
      method: "POST",
      headers: { Origin: origin, "Idempotency-Key": randomUUID(), ...headers },
      body,
    });
  assert.equal(
    (await post("{bad", { "Content-Type": "application/json" })).status,
    400,
  );
  assert.equal(
    (
      await post(JSON.stringify({ text: "x".repeat(14000) }), {
        "Content-Type": "application/json",
      })
    ).status,
    413,
  );
  assert.equal(
    (await post("text", { "Content-Type": "text/plain" })).status,
    415,
  );
  assert.equal(
    (
      await fetch(`${origin}/api/client-enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      })
    ).status,
    403,
  );
  assert.equal(
    (await send(sample, randomUUID(), origin.replace("http:", "https:")))
      .status,
    201,
  );
});
test("simultaneous retries cannot create two stored enquiries", async () => {
  const id = randomUUID();
  const before = await readdir(directory);
  const responses = await Promise.all([send(sample, id), send(sample, id)]);
  assert.ok(responses.some((r) => r.status === 201));
  assert.ok(responses.every((r) => [200, 201, 409].includes(r.status)));
  assert.equal(
    (await readdir(directory)).filter((n) => !before.includes(n)).length,
    1,
  );
});
test("rate limiting applies to submissions but not configuration", async () => {
  const app = await createApplicationApp({ directory, key, rateLimit: 1 });
  const limited = app.listen(0, "127.0.0.1");
  await new Promise((r) => limited.once("listening", r));
  const url = `http://127.0.0.1:${limited.address().port}`;
  try {
    const post = () =>
      fetch(`${url}/api/client-enquiry`, {
        method: "POST",
        headers: {
          Origin: url,
          "Content-Type": "application/json",
          "Idempotency-Key": randomUUID(),
        },
        body: JSON.stringify(sample),
      });
    assert.equal((await post()).status, 201);
    assert.equal((await post()).status, 429);
    assert.equal((await fetch(`${url}/api/client-enquiry/config`)).status, 200);
  } finally {
    await new Promise((r) => limited.close(r));
  }
});
test("existing host-only management handles employer reference export and deletion without exposing contact details in listings", async () => {
  const r = await send();
  const receipt = await r.json();
  const run = promisify(execFile);
  const env = {
    ...process.env,
    APPLICATION_DATA_DIR: directory,
    APPLICATION_ENCRYPTION_KEY: key,
  };
  const cli = (...args) =>
    run(process.execPath, ["server/manage.js", ...args, "--test"], { env });
  const listing = await cli("list");
  assert.ok(listing.stdout.includes("employer-enquiry"));
  assert.equal(listing.stdout.includes(sample.email), false);
  env.APPLICATION_RETENTION_DAYS = "1";
  delete env.ENQUIRY_RETENTION_DAYS;
  assert.ok(
    (await cli("purge", "--confirm")).stdout.includes(
      `Skipped ${receipt.reference}`,
    ),
  );
  assert.ok((await cli("list")).stdout.includes(receipt.reference));
  const output = join(directory, "private-export", "enquiry.json");
  await cli("export", receipt.reference, "--output", output);
  assert.equal(
    JSON.parse(await readFile(output, "utf8")).answers.company,
    sample.company,
  );
  await cli("delete", receipt.reference, "--confirm");
  assert.equal((await cli("list")).stdout.includes(receipt.reference), false);
});

test("storage failure cannot return an accepted receipt", async () => {
  const folder = await mkdtemp(join(tmpdir(), "chc-enquiry-failure-"));
  const app = await createApplicationApp({ directory: folder, key });
  const failing = app.listen(0, "127.0.0.1");
  await new Promise((r) => failing.once("listening", r));
  const url = `http://127.0.0.1:${failing.address().port}`;
  try {
    await rm(folder, { recursive: true, force: true });
    const r = await fetch(`${url}/api/client-enquiry`, {
      method: "POST",
      headers: {
        Origin: url,
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify(sample),
    });
    assert.equal(r.status, 503);
    const body = await r.json();
    assert.match(body.error, /could not be confirmed/);
    assert.equal(body.reference, undefined);
  } finally {
    await new Promise((r) => failing.close(r));
    await rm(folder, { recursive: true, force: true });
  }
});

test("live employer intake is opt-in and can be enabled independently of driver intake", async () => {
  const names = [
    "APPLICATIONS_ENABLED",
    "ENQUIRIES_ENABLED",
    "APPLICATION_NOTICE_VERSION",
    "APP_ORIGIN",
    "APPLICATION_DATA_DIR",
    "APPLICATION_SCANNER",
    "TRUST_PROXY_HOPS",
  ];
  const prior = Object.fromEntries(names.map((n) => [n, process.env[n]]));
  let live;
  try {
    Object.assign(process.env, {
      APPLICATIONS_ENABLED: "true",
      ENQUIRIES_ENABLED: "false",
      APPLICATION_NOTICE_VERSION: "approved-fixture-test-only",
      APP_ORIGIN: "https://citizen.test",
      APPLICATION_DATA_DIR: directory,
      APPLICATION_SCANNER: "/bin/true",
      TRUST_PROXY_HOPS: "1",
    });
    let app = await createApplicationApp({ mode: "live", directory, key });
    live = app.listen(0, "127.0.0.1");
    await new Promise((r) => live.once("listening", r));
    let url = `http://127.0.0.1:${live.address().port}`;
    assert.equal(
      (await (await fetch(`${url}/api/client-enquiry/config`)).json())
        .accepting,
      false,
    );
    await new Promise((r) => live.close(r));
    live = null;
    process.env.APPLICATIONS_ENABLED = "false";
    process.env.ENQUIRIES_ENABLED = "true";
    app = await createApplicationApp({ mode: "live", directory, key });
    live = app.listen(0, "127.0.0.1");
    await new Promise((r) => live.once("listening", r));
    url = `http://127.0.0.1:${live.address().port}`;
    assert.equal(
      (await (await fetch(`${url}/api/applications/config`)).json()).accepting,
      false,
    );
    const r = await fetch(`${url}/api/client-enquiry`, {
      method: "POST",
      headers: {
        Origin: "https://citizen.test",
        "X-Forwarded-Proto": "https",
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify(sample),
    });
    assert.equal(r.status, 201);
    assert.equal((await r.json()).mode, "live");
  } finally {
    if (live) await new Promise((r) => live.close(r));
    for (const n of names) {
      if (prior[n] === undefined) delete process.env[n];
      else process.env[n] = prior[n];
    }
  }
});
