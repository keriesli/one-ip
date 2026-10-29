import { isIP } from "node:net";

// Pages and standalone Node have no native rate-limit bindings.
// This fallback is bounded and local to one isolate/process.
const counters = new Map();
const maxKeys = 10_000;
let window = -1;

/** One IPv6 subscriber usually owns a whole /64; count it as one client. */
export function rateKey(ip) {
  if (isIP(ip) !== 6) return ip;
  const [left, right] = ip.toLowerCase().split("::");
  const head = left ? left.split(":") : [];
  const tail = right ? right.split(":") : [];
  const groups =
    right === undefined
      ? head
      : [...head, ...Array(8 - head.length - tail.length).fill("0"), ...tail];
  return `${groups
    .slice(0, 4)
    .map((group) => group.replace(/^0+(?=.)/, ""))
    .join(":")}::/64`;
}

export async function rateLimit(binding, ip, bucket, limit) {
  const key = rateKey(ip);
  if (binding) return (await binding.limit({ key })).success;
  const current = Math.floor(Date.now() / 60_000);
  if (current !== window) {
    counters.clear();
    window = current;
  }
  const id = `${bucket}:${key}`;
  const count = counters.get(id) ?? 0;
  if (count >= limit) return false;
  // Evict the oldest client rather than rejecting every new visitor when full.
  if (!counters.has(id) && counters.size >= maxKeys)
    counters.delete(counters.keys().next().value);
  counters.set(id, count + 1);
  return true;
}
