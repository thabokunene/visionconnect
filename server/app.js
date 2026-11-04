import { enquiryRouter } from "./enquiry.js";
import express from "express";
import multer from "multer";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHmac,
  createHash,
} from "node:crypto";
import {
  mkdir,
  readFile,
  open,
  rename,
  unlink,
  mkdtemp,
  rm,
  chmod,
} from "node:fs/promises";
import { resolve, isAbsolute, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  fileError,
  normalizeAnswers,
  validateAnswers,
} from "../src/application-schema.js";
const run = promisify(execFile);
const production = process.env.NODE_ENV === "production";
export async function createApplicationApp(options = {}) {
  const mode = options.mode || (production ? "live" : "test");
  const root = resolve(
    options.directory ||
      process.env.APPLICATION_DATA_DIR ||
      "../.citizen-application-data",
  );
  const siteRoot = fileURLToPath(new URL("../", import.meta.url));
  const insideSite = relative(siteRoot, root);
  if (!insideSite || (!insideSite.startsWith("..") && !isAbsolute(insideSite)))
    throw new Error(
      "Application storage must be outside the website repository and public files.",
    );
  let key = options.key || process.env.APPLICATION_ENCRYPTION_KEY;
  const enabled =
    mode === "test" || process.env.APPLICATIONS_ENABLED === "true";
  const notice =
    process.env.APPLICATION_NOTICE_VERSION || "draft-v1.2-test-only";
  if (
    mode === "live" &&
    ((!enabled && process.env.ENQUIRIES_ENABLED !== "true") ||
      !/^[a-f\d]{64}$/i.test(key || "") ||
      !process.env.APPLICATION_NOTICE_VERSION ||
      !process.env.APP_ORIGIN?.startsWith("https://") ||
      !isAbsolute(process.env.APPLICATION_DATA_DIR || "") ||
      !isAbsolute(process.env.APPLICATION_SCANNER || ""))
  )
    throw new Error(
      "Live intake is locked. Configure at least one enabled intake, an approved notice version, a 32-byte hex encryption key, absolute private data directory, HTTPS APP_ORIGIN and an absolute APPLICATION_SCANNER executable.",
    );
  await mkdir(root, { recursive: true, mode: 0o700 });
  await chmod(root, 0o700);
  if (!key) {
    const keyPath = join(root, ".test-key");
    try {
      key = await readFile(keyPath, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      key = randomBytes(32).toString("hex");
      const handle = await open(keyPath, "wx", 0o600);
      await handle.writeFile(key);
      await handle.close();
    }
  }
  if (!/^[a-f\d]{64}$/i.test(key))
    throw new Error("Encryption key must be 64 hexadecimal characters.");
  const secret = Buffer.from(key, "hex");
  const app = express();
  app.disable("x-powered-by");
  if (process.env.TRUST_PROXY_HOPS)
    app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use((_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.use(
    "/api/client-enquiry",
    enquiryRouter({
      root,
      secret,
      mode,
      notice,
      decrypt: decryptBundle,
      limit: options.rateLimit || 15,
    }),
  );
  app.get("/api/applications/config", (_req, res) =>
    res.json({
      mode,
      accepting: enabled,
      noticeVersion: notice,
      maxFileBytes: 5242880,
    }),
  );
  app.use(
    "/api/applications",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: options.rateLimit || 15,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: {
        error:
          "Too many attempts. Wait 15 minutes, then try again. Your application has not been confirmed.",
      },
    }),
  );
  let active = 0;
  const inFlight = new Set();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 7,
      fields: 1,
      fieldSize: 24000,
      parts: 8,
    },
  }).fields(
    [
      "certifiedId",
      "licenceFront",
      "licenceBack",
      "prdpDocument",
      "medical",
      "cv",
      "certificates",
    ].map((name) => ({ name, maxCount: 1 })),
  );
  app.post(
    "/api/applications",
    (req, res, next) => {
      let allowedOrigin = req.get("origin") === process.env.APP_ORIGIN;
      if (mode === "test") {
        // The browser may use HTTPS at the preview proxy while Vite forwards over HTTP.
        try {
          const from = new URL(req.get("origin"));
          allowedOrigin =
            ["https:", "http:"].includes(from.protocol) &&
            from.host === req.get("host");
        } catch {
          allowedOrigin = false;
        }
      }
      if (!allowedOrigin)
        return res
          .status(403)
          .json({ error: "Submit from the application page on this website." });
      if (mode === "live" && !req.secure)
        return res
          .status(400)
          .json({ error: "A secure HTTPS connection is required." });
      if (!enabled)
        return res
          .status(503)
          .json({ error: "Application intake is not open." });
      if (!req.is("multipart/form-data"))
        return res.status(415).json({
          error: "Submit the multipart application form from this website.",
        });
      if (active >= 2)
        return res.status(503).json({
          error:
            "The service is busy. Wait a moment and retry; keep this page open.",
        });
      active++;
      let released = false;
      req.releaseIntake = () => {
        if (!released) {
          released = true;
          active--;
        }
      };
      // A disconnected client must not free a slot while scanning/storage is still running.
      res.once("close", () => {
        if (!req.intakeProcessing) req.releaseIntake();
      });
      next();
    },
    upload,
    async (req, res, next) => {
      req.intakeProcessing = true;
      let id;
      let acquired = false;
      try {
        const requestId = req.get("Idempotency-Key");
        if (!/^[a-f\d-]{36}$/i.test(requestId || ""))
          return res.status(400).json({
            error:
              "Missing application request identifier. Reload the form and try again.",
          });
        let raw;
        try {
          raw = JSON.parse(req.body?.answers);
        } catch {
          return res
            .status(400)
            .json({ error: "Application answers could not be read." });
        }
        const answers = normalizeAnswers(raw);
        const errors = validateAnswers(answers);
        if (Object.keys(errors).length)
          return res
            .status(422)
            .json({ error: "Please correct the application answers.", errors });
        const files = Object.values(req.files || {})
          .flat()
          .sort((a, b) => a.fieldname.localeCompare(b.fieldname));
        for (const file of files) {
          const error = fileError(file.fieldname, {
            name: file.originalname,
            size: file.size,
          });
          const ext = file.originalname.toLowerCase().split(".").pop();
          const b = file.buffer;
          const signature =
            ext === "pdf"
              ? b.subarray(0, 5).toString() === "%PDF-"
              : ext === "png"
                ? b
                    .subarray(0, 8)
                    .equals(Buffer.from("89504e470d0a1a0a", "hex"))
                : ["jpg", "jpeg"].includes(ext)
                  ? b[0] === 255 && b[1] === 216 && b[2] === 255
                  : ext === "doc"
                    ? b
                        .subarray(0, 8)
                        .equals(Buffer.from("d0cf11e0a1b11ae1", "hex"))
                    : ext === "docx" &&
                      b.subarray(0, 4).equals(Buffer.from("504b0304", "hex"));
          if (error || !signature)
            return res.status(422).json({
              error: `${file.fieldname}: ${error || "The file contents do not match the file extension."}`,
            });
        }
        id = createHmac("sha256", secret).update(requestId).digest("hex");
        const digest = createHash("sha256").update(JSON.stringify(answers));
        for (const f of files)
          digest.update(f.fieldname).update(f.originalname).update(f.buffer);
        const fingerprint = digest.digest("hex");
        if (inFlight.has(id))
          return res.status(409).json({
            error:
              "This request is still being processed. Please retry shortly.",
          });
        inFlight.add(id);
        acquired = true;
        const destination = join(root, `${id}.enc`);
        try {
          const prior = decryptBundle(await readFile(destination), secret);
          if (prior.fingerprint !== fingerprint)
            return res.status(409).json({
              error:
                "This request already has a receipt. Start a new application for different answers.",
            });
          return res.json(prior.receipt);
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
        }
        if (mode === "live" && files.length) {
          const temp = await mkdtemp(join(root, ".scan-"));
          let scanned = true;
          try {
            for (const [i, file] of files.entries()) {
              const path = join(temp, String(i));
              const h = await open(path, "wx", 0o600);
              try {
                await h.writeFile(file.buffer);
              } finally {
                await h.close();
              }
              await run(
                process.env.APPLICATION_SCANNER,
                ["--no-summary", path],
                { timeout: 60000, maxBuffer: 4096 },
              );
            }
          } catch {
            scanned = false;
          } finally {
            await rm(temp, { recursive: true, force: true });
          }
          if (!scanned)
            return res.status(503).json({
              error:
                "Documents could not pass the security scan. Nothing has been accepted. Remove the documents to submit without them, or ask for assistance.",
            });
        }
        const receipt = {
          reference: `CHC-${randomBytes(6).toString("hex").toUpperCase()}`,
          receivedAt: new Date().toISOString(),
          mode,
        };
        const bundle = {
          version: 1,
          receipt,
          fingerprint,
          noticeVersion: notice,
          answers,
          documents: files.map((f) => ({
            category: f.fieldname,
            name: f.originalname,
            size: f.size,
            bytes: f.buffer.toString("base64"),
          })),
        };
        const iv = randomBytes(12);
        const cipher = createCipheriv("aes-256-gcm", secret, iv);
        const encrypted = Buffer.concat([
          cipher.update(JSON.stringify(bundle)),
          cipher.final(),
        ]);
        const tempPath = `${destination}.${randomBytes(8).toString("hex")}.tmp`;
        const h = await open(tempPath, "wx", 0o600);
        try {
          await h.writeFile(
            Buffer.concat([iv, cipher.getAuthTag(), encrypted]),
          );
          await h.sync();
        } finally {
          await h.close();
        }
        try {
          await rename(tempPath, destination);
          const dir = await open(root, "r");
          try {
            await dir.sync();
          } finally {
            await dir.close();
          }
        } catch (error) {
          await unlink(tempPath).catch(() => {});
          throw error;
        }
        res.status(201).json(receipt);
      } catch (error) {
        next(error);
      } finally {
        if (acquired) inFlight.delete(id);
        req.releaseIntake?.();
      }
    },
  );
  app.use((error, req, res, _next) => {
    req.releaseIntake?.();
    if (error instanceof multer.MulterError)
      return res.status(413).json({
        error:
          "Upload limit reached. Use at most seven files, one per category, up to 5 MB each.",
      });
    // Deliberately do not log request bodies, filenames, IDs or encryption secrets.
    console.error("Application intake failure:", error.code || error.name);
    res.status(503).json({
      error:
        "We could not confirm receipt. Keep this page open and retry. No success has been recorded in this browser.",
    });
  });
  return app;
}
export function decryptBundle(buffer, key) {
  const decipher = createDecipheriv("aes-256-gcm", key, buffer.subarray(0, 12));
  decipher.setAuthTag(buffer.subarray(12, 28));
  return JSON.parse(
    Buffer.concat([
      decipher.update(buffer.subarray(28)),
      decipher.final(),
    ]).toString("utf8"),
  );
}
