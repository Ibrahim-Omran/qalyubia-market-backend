import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;

export async function redisHealthCheck() {
  if (!redis) return { configured: false, ok: false };
  try {
    const value = await redis.ping();
    return { configured: true, ok: value === "PONG" || value === true };
  } catch {
    return { configured: true, ok: false };
  }
}
