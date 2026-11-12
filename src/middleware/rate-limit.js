const buckets = new Map();

function loginRateLimit({ windowMs = 60_000, max = 10 } = {}) {
  return (req, res, next) => {
    const address = req.ip || req.socket?.remoteAddress || "unknown";
    const identity = typeof req.body?.employeeCode === "string" ? req.body.employeeCode.trim().toLowerCase() : "unknown";
    const key = `${address}:${identity}`;
    const now = Date.now();
    const current = buckets.get(key);
    if (!current || now >= current.resetAt) buckets.set(key, { count: 1, resetAt: now + windowMs });
    else current.count += 1;
    const bucket = buckets.get(key);
    res.set("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
    if (bucket.count > max) return res.status(429).json({ status: 429, message: "Too many authentication attempts" });
    next();
  };
}

module.exports = loginRateLimit;
