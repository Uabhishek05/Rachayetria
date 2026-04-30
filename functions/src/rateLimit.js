const buckets = new Map();

function nowMs() {
  return Date.now();
}

function getClientId(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]?.trim();
  const userId = req.headers['x-user-id'];
  const authId = req.headers['x-auth-uid'];
  return String(userId || authId || ip || req.ip || 'anonymous');
}

function pickPolicy(pathname) {
  if (pathname.startsWith('/codex')) {
    return { capacity: 12, refillPerSec: 0.25, retryFloorSec: 4 };
  }
  if (pathname.startsWith('/admin')) {
    return { capacity: 40, refillPerSec: 0.8, retryFloorSec: 2 };
  }
  return { capacity: 80, refillPerSec: 1.8, retryFloorSec: 1 };
}

function keyFor(req) {
  return getClientId(req) + '::' + req.path;
}

function cleanupBuckets() {
  const current = nowMs();
  for (const [key, bucket] of buckets.entries()) {
    if (current - bucket.lastSeenMs > 15 * 60 * 1000) {
      buckets.delete(key);
    }
  }
}

setInterval(cleanupBuckets, 5 * 60 * 1000).unref();

export function tokenBucketLimiter(req, res, next) {
  const policy = pickPolicy(req.path);
  const key = keyFor(req);
  const current = nowMs();
  const refillPerMs = policy.refillPerSec / 1000;

  const bucket = buckets.get(key) ?? {
    tokens: policy.capacity,
    lastRefillMs: current,
    lastSeenMs: current,
  };

  const elapsedMs = Math.max(0, current - bucket.lastRefillMs);
  bucket.tokens = Math.min(policy.capacity, bucket.tokens + elapsedMs * refillPerMs);
  bucket.lastRefillMs = current;
  bucket.lastSeenMs = current;

  if (bucket.tokens < 1) {
    const missingTokens = 1 - bucket.tokens;
    const retryAfter = Math.max(policy.retryFloorSec, Math.ceil(missingTokens / policy.refillPerSec));
    res.set('Retry-After', String(retryAfter));
    res.set('RateLimit-Limit', String(policy.capacity));
    res.set('RateLimit-Remaining', '0');
    res.status(429).json({
      error: 'Too many requests',
      retryAfterSec: retryAfter,
    });
    return;
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);

  res.set('RateLimit-Limit', String(policy.capacity));
  res.set('RateLimit-Remaining', String(Math.floor(bucket.tokens)));
  next();
}
