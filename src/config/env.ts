import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  clientUrl: process.env.CLIENT_URL ?? "*",
  redisRestUrl: process.env.UPSTASH_REDIS_REST_URL ?? "",
  redisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
  publishingFee: Number(process.env.PUBLISHING_FEE_EGP ?? 50),
  paymobApiKey: process.env.PAYMOB_API_KEY ?? "",
  paymobIntegrationId: process.env.PAYMOB_INTEGRATION_ID ?? "",
  paymobIframeId: process.env.PAYMOB_IFRAME_ID ?? "",
  paymobHmacSecret: process.env.PAYMOB_HMAC_SECRET ?? ""
};
