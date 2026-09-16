import {Redis} from '@upstash/redis';

// Upstash for Redis (Vercel Marketplace) injects KV_REST_API_URL / KV_REST_API_TOKEN,
// and fromEnv() reads those names as well as UPSTASH_REDIS_REST_*.
export const redis = Redis.fromEnv();
