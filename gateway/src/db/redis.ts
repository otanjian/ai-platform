import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

export async function getToken(
  userId: string,
  system: "superset" | "taskview" | "buildingai" | "dataease",
): Promise<string | null> {
  const key = `token:${userId}:${system}`
  return redis.get(key)
}

export async function setToken(
  userId: string,
  system: "superset" | "taskview" | "buildingai" | "dataease",
  token: string,
  ttlSeconds: number,
): Promise<void> {
  const key = `token:${userId}:${system}`
  await redis.setex(key, ttlSeconds, token)
}

export async function deleteToken(
  userId: string,
  system: "superset" | "taskview" | "buildingai" | "dataease",
): Promise<void> {
  const key = `token:${userId}:${system}`
  await redis.del(key)
}

export async function cacheHealth(system: string, status: "online" | "offline", ttlSeconds: number = 30): Promise<void> {
  const key = `health:${system}`;
  await redis.setex(key, ttlSeconds, status);
}

export async function getHealth(system: string): Promise<string | null> {
  const key = `health:${system}`;
  return redis.get(key);
}

export async function cacheStats(key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
  await redis.setex(`stats:${key}`, ttlSeconds, JSON.stringify(value));
}

export async function getStats(key: string): Promise<unknown | null> {
  const value = await redis.get(`stats:${key}`);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export async function closeRedis(): Promise<void> {
  await redis.quit();
}
