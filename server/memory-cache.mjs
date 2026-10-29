/**
 * Minimal in-process stand-in for the Workers `caches.default` API.
 * Only responses with `Cache-Control: max-age` are stored; entries are bounded
 * by count and total bytes and evicted oldest-first.
 */
export function memoryCache({
  maxEntries = 1000,
  maxBytes = 32 * 1024 * 1024,
  now = Date.now,
} = {}) {
  const entries = new Map();
  let bytes = 0;
  const remove = (key) => {
    const entry = entries.get(key);
    if (!entry) return;
    bytes -= entry.body.byteLength;
    entries.delete(key);
  };
  const keyOf = (request) =>
    typeof request === "string" ? request : new URL(request.url).href;

  return {
    async match(request) {
      const key = keyOf(request);
      const entry = entries.get(key);
      if (!entry) return undefined;
      if (entry.expires <= now()) {
        remove(key);
        return undefined;
      }
      return new Response(entry.body.slice(), {
        status: entry.status,
        headers: entry.headers,
      });
    },
    async put(request, response) {
      const key = keyOf(request);
      const ttl = Number(
        /(?:^|,)\s*(?:s-)?max-age=(\d+)/i.exec(
          response.headers.get("Cache-Control") ?? "",
        )?.[1],
      );
      if (
        !(ttl > 0) ||
        response.status !== 200 ||
        response.headers.has("Set-Cookie")
      ) {
        await response.body?.cancel();
        return;
      }
      const body = new Uint8Array(await response.arrayBuffer());
      if (body.byteLength > maxBytes / 4) return;
      remove(key);
      entries.set(key, {
        body,
        status: response.status,
        headers: [...response.headers],
        expires: now() + ttl * 1000,
      });
      bytes += body.byteLength;
      for (const oldest of entries.keys()) {
        if (entries.size <= maxEntries && bytes <= maxBytes) break;
        remove(oldest);
      }
    },
    async delete(request) {
      const key = keyOf(request);
      const found = entries.has(key);
      remove(key);
      return found;
    },
  };
}

export function installMemoryCache(options) {
  if (globalThis.caches?.default) return;
  globalThis.caches = { default: memoryCache(options) };
}
