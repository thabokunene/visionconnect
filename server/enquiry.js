import express from "express";
import { rateLimit } from "express-rate-limit";
import {
  randomBytes,
  createHash,
  createHmac,
  createCipheriv,
} from "node:crypto";
import { readFile, open, rename, unlink } from "node:fs/promises";
import { join } from "node:path";
import { validateEnquiry } from "../src/employer-schema.js";

// Uses the same private store/key and operational boundary as driver intake.
export function enquiryRouter({
  root,
  secret,
  mode,
  notice,
  decrypt,
  limit = 15,
}) {
  const router = express.Router();
  const accepting = mode === "test" || process.env.ENQUIRIES_ENABLED === "true";
  const inFlight = new Set();
  let active = 0;
  router.get("/config", (_req, res) =>
    res.json({ mode, accepting, noticeVersion: notice }),
  );
  router.post(
    "/",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: {
        error:
          "Too many attempts. Wait 15 minutes before retrying. Receipt has not been confirmed.",
      },
    }),
    (req, res, next) => {
      let allowed =
        !!process.env.APP_ORIGIN &&
        req.get("origin") === process.env.APP_ORIGIN;
      if (mode === "test") {
        try {
          const origin = new URL(req.get("origin"));
          allowed =
            ["http:", "https:"].includes(origin.protocol) &&
            origin.host === req.get("host");
        } catch {
          allowed = false;
        }
      }
      if (!allowed)
        return res
          .status(403)
          .json({ error: "Submit from the enquiry form on this website." });
      if (mode === "live" && !req.secure)
        return res
          .status(400)
          .json({ error: "A secure HTTPS connection is required." });
      if (!accepting)
        return res.status(503).json({
          error:
            "Client enquiries are not open for online submission. Call reception for assistance.",
        });
      if (!req.is("application/json"))
        return res.status(415).json({ error: "Send the enquiry as JSON." });
      if (active >= 4)
        return res.status(503).json({
          error:
            "The enquiry service is busy. Keep this page open and retry shortly.",
        });
      active++;
      let released = false;
      req.releaseEnquiry = () => {
        if (!released) {
          active--;
          released = true;
        }
      };
      res.once("close", () => {
        if (!req.enquiryProcessing) req.releaseEnquiry();
      });
      next();
    },
    express.json({ limit: "12kb", strict: true }),
    async (req, res, next) => {
      req.enquiryProcessing = true;
      let id;
      let locked = false;
      try {
        const requestId = req.get("Idempotency-Key");
        if (
          !/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(
            requestId || "",
          )
        )
          return res.status(400).json({
            error:
              "Missing enquiry request identifier. Reload the page and try again.",
          });
        const { data, errors } = validateEnquiry(req.body);
        if (Object.keys(errors).length)
          return res
            .status(422)
            .json({ error: "Please check the enquiry fields.", errors });
        id = createHmac("sha256", secret)
          .update(`employer:${requestId}`)
          .digest("hex");
        const fingerprint = createHash("sha256")
          .update(JSON.stringify(data))
          .digest("hex");
        if (inFlight.has(id))
          return res.status(409).json({
            error: "This enquiry is still processing. Please retry shortly.",
          });
        inFlight.add(id);
        locked = true;
        const destination = join(root, `${id}.enc`);
        try {
          const prior = decrypt(await readFile(destination), secret);
          if (prior.fingerprint !== fingerprint)
            return res.status(409).json({
              error:
                "This request already has a receipt. Start a new enquiry for different answers.",
            });
          return res.json(prior.receipt);
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
        }
        const receipt = {
          reference: `ENQ-${randomBytes(6).toString("hex").toUpperCase()}`,
          receivedAt: new Date().toISOString(),
          mode,
        };
        const record = {
          version: 1,
          kind: "employer-enquiry",
          receipt,
          fingerprint,
          noticeVersion: notice,
          answers: data,
          documents: [],
        };
        const iv = randomBytes(12);
        const cipher = createCipheriv("aes-256-gcm", secret, iv);
        const encrypted = Buffer.concat([
          cipher.update(JSON.stringify(record)),
          cipher.final(),
        ]);
        const temporary = `${destination}.${randomBytes(8).toString("hex")}.tmp`;
        try {
          const file = await open(temporary, "wx", 0o600);
          try {
            await file.writeFile(
              Buffer.concat([iv, cipher.getAuthTag(), encrypted]),
            );
            await file.sync();
          } finally {
            await file.close();
          }
          await rename(temporary, destination);
          const dir = await open(root, "r");
          try {
            await dir.sync();
          } finally {
            await dir.close();
          }
        } catch (error) {
          await unlink(temporary).catch(() => {});
          throw error;
        }
        return res.status(201).json(receipt);
      } catch (error) {
        next(error);
      } finally {
        if (locked) inFlight.delete(id);
        req.releaseEnquiry?.();
      }
    },
  );
  router.use((error, req, res, _next) => {
    req.releaseEnquiry?.();
    if (error.type === "entity.too.large")
      return res.status(413).json({
        error:
          "The enquiry is too large. Shorten the description and try again.",
      });
    if (error.type === "entity.parse.failed")
      return res.status(400).json({
        error: "The enquiry could not be read. Check your answers and retry.",
      });
    console.error("Enquiry storage failure:", error.code || error.name);
    res.status(503).json({
      error:
        "Receipt could not be confirmed. Keep this page open and retry with the same answers, or call reception.",
    });
  });
  return router;
}
