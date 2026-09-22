import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleMonthlyDonation } from "./routes/donations-monthly";
import {
  handlePayUFailure,
  handlePayUSuccess,
  handlePayUWebhook,
} from "./routes/payu-callbacks";
import { createIpRateLimiter } from "./lib/rate-limit";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "32kb" }));
  app.use(express.urlencoded({ extended: true, limit: "64kb" }));

  const donationLimiter = createIpRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
      error: "Too many donation attempts. Please try again shortly.",
      code: "RATE_LIMITED",
    },
  });

  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  app.post("/api/donations/monthly", donationLimiter, handleMonthlyDonation);

  app.post("/api/payu/success", handlePayUSuccess);
  app.get("/api/payu/success", handlePayUSuccess);
  app.post("/api/payu/failure", handlePayUFailure);
  app.get("/api/payu/failure", handlePayUFailure);
  app.post("/api/payu/webhook", handlePayUWebhook);

  return app;
}
