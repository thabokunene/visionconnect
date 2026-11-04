import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { createApplicationApp, decryptBundle } from "./app.js";
import { idBirthDate, validateAnswers } from "../src/application-schema.js";
const key = "a1".repeat(32);
let server, directory, origin;
export const sampleAnswers = {
  firstName: "Test",
  surname: "Applicant",
  saId: "9001015009086",
  mobile: "0821234567",
  email: "test@example.com",
  city: "Test Town",
  province: "Gauteng",
  rightToWork: "Yes",
  licence: "Code 14 / EC",
  licenceIssued: "2020-01-01",
  licenceExpiry: "2028-01-01",
  prdp: "No",
  years: "5",
  vehicles: ["Rigid", "Tanker"],
  routes: ["Local", "Regional"],
  employment: "Available immediately",
  preferredProvinces: ["Gauteng", "Limpopo"],
  shift: "Day",
  earliestStart: "2026-12-01",
  transport: "Yes",
  processingConsent: true,
  marketingConsent: false,
};
before(async () => {
  directory = await mkdtemp(join(tmpdir(), "chc-api-test-"));
  const app = await createApplicationApp({ directory, key, rateLimit: 100 });
  server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((r) => server.close(r));
  await rm(directory, { recursive: true, force: true });
});
async function submit(
  answers = sampleAnswers,
  id = randomUUID(),
  file = null,
  from = origin,
) {
  const body = new FormData();
  body.set("answers", JSON.stringify(answers));
  if (file)
    body.set(file.slot || "certifiedId", new Blob([file.bytes]), file.name);
  return fetch(`${origin}/api/applications`, {
    method: "POST",
    body,
    headers: { Origin: from, "Idempotency-Key": id },
  });
}
test("validates ID checksum and embedded calendar dates, zero years and branched fields", () => {
  assert.equal(idBirthDate(sampleAnswers.saId), "1990-01-01");
  assert.equal(idBirthDate("9002315009087"), null);
  assert.equal(idBirthDate("9001015009080"), null);
  assert.deepEqual(
    validateAnswers({
      ...sampleAnswers,
      years: "0",
      prdpExpiry: "nonsense",
      notice: "nonsense",
    }),
    {},
  );
  assert.ok(
    validateAnswers({ ...sampleAnswers, preferredProvinces: ["Mars"] })
      .preferredProvinces,
  );
  assert.ok(
    validateAnswers({ ...sampleAnswers, employment: "Employed", notice: "" })
      .notice,
  );
  assert.ok(
    validateAnswers({ ...sampleAnswers, licenceIssued: "2020-02-30" })
      .licenceIssued,
  );
  assert.ok(validateAnswers({ ...sampleAnswers, mobile: "1234567890" }).mobile);
});
test("config declares test mode and has no cache", async () => {
  const r = await fetch(`${origin}/api/applications/config`);
  assert.match(r.headers.get("cache-control"), /no-store/);
  assert.equal((await r.json()).mode, "test");
});
test("persists actual document bytes encrypted and returns a server reference; retries are idempotent", async () => {
  const id = randomUUID();
  const pdf = {
    bytes: "%PDF-1.4\nfictional sample\n%%EOF",
    name: "sample.pdf",
  };
  const before = await readdir(directory);
  const first = await submit(sampleAnswers, id, pdf);
  assert.equal(first.status, 201);
  const receipt = await first.json();
  assert.match(receipt.reference, /^CHC-[A-F0-9]{12}$/);
  const added = (await readdir(directory)).filter((f) => !before.includes(f));
  assert.equal(added.length, 1);
  const encrypted = await readFile(join(directory, added[0]));
  assert.equal(encrypted.includes(Buffer.from(sampleAnswers.saId)), false);
  assert.equal(encrypted.includes(Buffer.from("%PDF")), false);
  const stored = decryptBundle(encrypted, Buffer.from(key, "hex"));
  assert.equal(stored.answers.marketingConsent, false);
  assert.equal(
    Buffer.from(stored.documents[0].bytes, "base64").toString(),
    pdf.bytes,
  );
  assert.equal(stored.receipt.reference, receipt.reference);
  const retry = await submit(sampleAnswers, id, pdf);
  assert.equal(retry.status, 200);
  assert.deepEqual(await retry.json(), receipt);
  const changed = await submit({ ...sampleAnswers, city: "Changed" }, id, pdf);
  assert.equal(changed.status, 409);
});
test("server independently rejects invalid answers, missing permission and unexpected fields", async () => {
  const r = await submit({
    ...sampleAnswers,
    processingConsent: false,
    preferredProvinces: [],
    saId: "123",
  });
  assert.equal(r.status, 422);
  const body = await r.json();
  assert.ok(body.errors.saId);
  assert.ok(body.errors.processingConsent);
  assert.ok(body.errors.preferredProvinces);
  const malicious = await submit({ ...sampleAnswers, vehicles: ["<script>"] });
  assert.equal(malicious.status, 422);
});
test("blocks foreign or absent origins and bad idempotency keys", async () => {
  assert.equal(
    (await submit(sampleAnswers, randomUUID(), null, "https://evil.example"))
      .status,
    403,
  );
  assert.equal((await submit(sampleAnswers, "bad-key")).status, 400);
});
test("rejects spoofed content, disallowed formats, empty/oversize files and extra categories", async () => {
  for (const file of [
    { name: "test.pdf", bytes: "not a PDF" },
    { name: "x.svg", bytes: "<svg/>" },
    { name: "empty.png", bytes: "" },
    { name: "huge.pdf", bytes: "%PDF-" + "x".repeat(5 * 1024 * 1024) },
    { name: "test.pdf", bytes: "%PDF-1.4", slot: "unknown" },
  ]) {
    const response = await submit(sampleAnswers, randomUUID(), file);
    assert.ok(
      [413, 422].includes(response.status),
      `${file.name}: ${response.status}`,
    );
  }
});
test("accepts a deferred-documents application and ignores stale branched values", async () => {
  const r = await submit({
    ...sampleAnswers,
    prdpExpiry: "bad",
    notice: "bad",
  });
  assert.equal(r.status, 201);
});
test("production mode fails closed without its operational configuration", async () => {
  await assert.rejects(
    () => createApplicationApp({ mode: "live", directory, key }),
    /Live intake is locked/,
  );
});

test("HTTPS preview origin keeps the original host; storage cannot sit inside the website", async () => {
  const r = await submit(
    sampleAnswers,
    randomUUID(),
    null,
    origin.replace("http:", "https:"),
  );
  assert.equal(r.status, 201);
  await assert.rejects(
    () => createApplicationApp({ directory: ".application-data", key }),
    /outside the website/,
  );
});

test("unsupported media types are rejected before parsing", async () => {
  const r = await fetch(`${origin}/api/applications`, {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: "{}",
  });
  assert.equal(r.status, 415);
});

test("host-only operations export actual bytes privately, refuse overwrite and require deletion confirmation", async () => {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const exec = promisify(execFile);
  const { stat } = await import("node:fs/promises");
  const r = await submit(sampleAnswers, randomUUID(), {
    name: "sample.pdf",
    bytes: "%PDF-1.4\nsample",
  });
  const receipt = await r.json();
  const env = {
    ...process.env,
    APPLICATION_DATA_DIR: directory,
    APPLICATION_ENCRYPTION_KEY: key,
  };
  const cli = (...args) =>
    exec(process.execPath, ["server/manage.js", ...args, "--test"], { env });
  const listing = await cli("list");
  assert.ok(listing.stdout.includes(receipt.reference));
  assert.equal(listing.stdout.includes(sampleAnswers.saId), false);
  const output = join(directory, "export", "record.json");
  await cli("export", receipt.reference, "--output", output);
  const bundle = JSON.parse(await readFile(output, "utf8"));
  assert.equal(bundle.answers.saId, sampleAnswers.saId);
  assert.equal(
    Buffer.from(bundle.documents[0].bytes, "base64").toString(),
    "%PDF-1.4\nsample",
  );
  assert.equal((await stat(output)).mode & 0o777, 0o600);
  await assert.rejects(() =>
    cli("export", receipt.reference, "--output", output),
  );
  await assert.rejects(() => cli("delete", receipt.reference));
  await cli("delete", receipt.reference, "--confirm");
  assert.equal((await cli("list")).stdout.includes(receipt.reference), false);
  await assert.rejects(() => cli("purge", "--confirm"));
});

test("live upload pipeline rejects scanner failure, cleans temporary files, and only accepts after a successful scan", async () => {
  const names = [
    "APPLICATIONS_ENABLED",
    "APPLICATION_NOTICE_VERSION",
    "APP_ORIGIN",
    "APPLICATION_DATA_DIR",
    "APPLICATION_SCANNER",
    "TRUST_PROXY_HOPS",
  ];
  const prior = Object.fromEntries(names.map((n) => [n, process.env[n]]));
  let liveServer;
  try {
    Object.assign(process.env, {
      APPLICATIONS_ENABLED: "true",
      APPLICATION_NOTICE_VERSION: "approved-fixture-test-only",
      APP_ORIGIN: "https://citizen.test",
      APPLICATION_DATA_DIR: directory,
      APPLICATION_SCANNER: "/bin/false",
      TRUST_PROXY_HOPS: "1",
    });
    const app = await createApplicationApp({ mode: "live", directory, key });
    liveServer = app.listen(0, "127.0.0.1");
    await new Promise((r) => liveServer.once("listening", r));
    const url = `http://127.0.0.1:${liveServer.address().port}/api/applications`;
    const send = (secure = true) => {
      const body = new FormData();
      body.set("answers", JSON.stringify(sampleAnswers));
      body.set("certifiedId", new Blob(["%PDF-1.4\nfictional"]), "sample.pdf");
      return fetch(url, {
        method: "POST",
        body,
        headers: {
          Origin: "https://citizen.test",
          "Idempotency-Key": randomUUID(),
          "X-Forwarded-Proto": secure ? "https" : "http",
        },
      });
    };
    assert.equal((await send(false)).status, 400);
    assert.equal((await send()).status, 503);
    assert.equal(
      (await readdir(directory)).some((n) => n.startsWith(".scan-")),
      false,
    );
    // Stub success tests orchestration, not antivirus detection. Real ClamAV/EICAR checks are a launch gate.
    process.env.APPLICATION_SCANNER = "/bin/true";
    const accepted = await send();
    assert.equal(accepted.status, 201);
    assert.equal((await accepted.json()).mode, "live");
  } finally {
    if (liveServer) await new Promise((r) => liveServer.close(r));
    for (const n of names) {
      if (prior[n] === undefined) delete process.env[n];
      else process.env[n] = prior[n];
    }
  }
});
