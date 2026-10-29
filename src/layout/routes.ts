import { t } from "@/i18n";
import { aiPlatforms } from "@/views/ai/platforms";

export const navigationRoutes = [
  {
    value: "/",
    label: t("navigation.overview"),
    short: t("navigation.overview"),
  },
  {
    value: "/lookup/",
    label: t("navigation.lookup"),
    short: t("navigation.lookup"),
  },
  {
    value: "/network/",
    label: t("navigation.network"),
    short: t("navigation.network"),
  },
  {
    value: "/browser/",
    label: t("navigation.browser"),
    short: t("navigation.browser"),
  },
  { value: "/ai/", label: "AI", short: "AI" },
] as const;
/** Each section is one page; its tools are tabs inside that page. */
export const toolGroups = {
  lookup: [
    { path: "/lookup/ip", label: t("navigation.ipCheck") },
    { path: "/lookup/whois", label: "WHOIS" },
    { path: "/lookup/subdomains", label: t("common.subdomainLookup") },
  ],
  network: [
    { path: "/network/connectivity", label: t("common.connectivityEgress") },
    { path: "/network/dns", label: t("common.dnsEgress") },
    { path: "/network/cdn", label: t("navigation.cdnNodes") },
    { path: "/network/speedtest", label: t("speedtest.title") },
    { path: "/network/ping", label: t("common.globalPing") },
  ],
  browser: [
    { path: "/browser/environment", label: t("common.environment") },
    { path: "/browser/fingerprint", label: t("common.fingerprint") },
    { path: "/browser/consistency", label: t("common.consistency") },
    { path: "/browser/automation", label: t("common.automation") },
    { path: "/browser/privacy", label: t("common.permissionsPrivacy") },
    { path: "/browser/challenges", label: t("common.humanVerification") },
  ],
  ai: [
    ...aiPlatforms.map((platform) => ({
      path: `/ai/${platform.id}`,
      label: platform.name,
    })),
    { path: "/ai/status", label: t("navigation.serviceStatus") },
  ],
} as const;
export type ToolGroup = keyof typeof toolGroups;
export const legacyRoutes: Record<string, string> = {
  "/query": "/lookup/ip",
  "/query/ip": "/lookup/ip",
  "/query/ip/:ip": "/lookup/ip",
  "/query/whois": "/lookup/whois",
  "/ip": "/lookup/ip",
  "/ip/:ip": "/lookup/ip",
  "/whois": "/lookup/whois",
  "/network/ip": "/lookup/ip",
  "/network/ip/:ip": "/lookup/ip",
  "/network/whois": "/lookup/whois",
  "/network/subdomains": "/lookup/subdomains",
  "/link": "/network/connectivity",
  "/network/link": "/network/connectivity",
  "/network/exits": "/network/connectivity",
  "/ping": "/network/ping",
  "/cdn": "/network/cdn",
  "/dns-exit": "/network/dns",
  "/network/dns-exit": "/network/dns",
  "/webrtc": "/browser/privacy",
  "/network/webrtc": "/browser/privacy",
  "/browser/webrtc": "/browser/privacy",
  "/gpt": "/ai/gpt",
  "/claude": "/ai/claude",
  "/status": "/ai/status",
  "/status/openai": "/ai/status/openai",
  "/status/claude": "/ai/status/claude",
  "/gpt/status.html": "/ai/status/openai",
  "/claude/status.html": "/ai/status/claude",
  "/ai/gpt/status": "/ai/status/openai",
  "/ai/claude/status": "/ai/status/claude",
};
export function activeNavigationRoute(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return "/";
  for (const [group, routes] of Object.entries(toolGroups)) {
    if (path === `/${group}` || routes.some((route) => route.path === path))
      return `/${group}/`;
  }
  if (/^\/lookup\/ip\/[^/]+$/.test(path)) return "/lookup/";
  return /^\/ai\/status\/(?:openai|claude)$/.test(path) ? "/ai/" : "not-found";
}

/** The tab that owns a path, including detail pages below a tab. */
export function activeTool(pathname: string) {
  const path = pathname.replace(/\/+$/, "");
  return Object.values(toolGroups)
    .flat()
    .find((tool) => path === tool.path || path.startsWith(`${tool.path}/`))
    ?.path;
}

export function visibleTools(group: ToolGroup, challengesConfigured: boolean) {
  return toolGroups[group].filter(
    (tool) => tool.path !== "/browser/challenges" || challengesConfigured,
  );
}
