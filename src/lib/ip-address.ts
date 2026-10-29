export function normalizeIp(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const ip = value.trim();
  if (ip.includes(":")) {
    if (!/^[\da-f:.]+$/i.test(ip)) return null;
    try {
      return new URL(`https://[${ip}]/`).hostname.slice(1, -1);
    } catch {
      return null;
    }
  }
  if (
    !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip) ||
    ip.split(".").some((part) => Number(part) > 255)
  )
    return null;
  return ip.split(".").map(Number).join(".");
}

export function sameIp(left: unknown, right: unknown): boolean {
  const ip = normalizeIp(left);
  return ip !== null && ip === normalizeIp(right);
}
