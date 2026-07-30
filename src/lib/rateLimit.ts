type Entry = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS = 3;
const buckets = new Map<string, Entry>();

export const checkRateLimit = (key: string) => {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_SUBMISSIONS - 1 };
  }

  if (current.count >= MAX_SUBMISSIONS) {
    return { allowed: false, remaining: 0 };
  }

  current.count += 1;
  buckets.set(key, current);
  return { allowed: true, remaining: MAX_SUBMISSIONS - current.count };
};
