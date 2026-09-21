import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { openapiDocument } from "./openapi";
import { router } from "./routes";
import { errorHandler, notFound } from "./middlewares/error";
import { env } from "./config/env";
import { redisHealthCheck } from "./lib/redis";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());
const allowedOrigins = env.clientUrl.split(",").map(origin => origin.trim()).filter(Boolean);

app.use(cors({
  origin: allowedOrigins.includes("*")
    ? true
    : (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error("CORS origin not allowed"));
      },
  credentials: true,
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.use(morgan("combined"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument, { explorer: true, customSiteTitle: "Qalyubia Market API Docs" }));
app.get("/api/openapi.json", (req, res) => res.json(openapiDocument));

app.get("/health", async (_req, res) => {
  const redis = await redisHealthCheck();
  const healthy = !redis.configured || redis.ok;
  res.status(healthy ? 200 : 503).json({
    success: healthy,
    service: "qalyubia-market-api",
    environment: env.nodeEnv,
    database: "configured",
    redis,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", router);

app.use(notFound);
app.use(errorHandler);
