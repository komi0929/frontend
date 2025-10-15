const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const arr = buckets.get(key) || [];
  // drop old
  while (arr.length && now - arr[0] > windowMs) arr.shift();
  arr.push(now);
  buckets.set(key, arr);
  return arr.length <= limit;
}