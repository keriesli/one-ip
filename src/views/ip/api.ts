import { t } from "@/i18n";
import { sameIp } from "@/lib/ip-address";
import { endpoint, request } from "@/lib/network";
import type { Geo } from "@/lib/types";
import { adaptCoffee, coffeeIpSchema } from "./coffee.ts";
import type { IpNetwork } from "./route-graph/types.ts";

export async function lookupIp(ip: string, signal?: AbortSignal) {
  const data = await request<unknown>(
    `https://ip.net.coffee/api/ip/lookup/${encodeURIComponent(ip)}`,
    { signal, mode: "cors", credentials: "omit", cache: "no-store" },
  );
  const result = coffeeIpSchema.safeParse(data);
  if (!result.success)
    throw new Error(t("api.theIpLocationSourceReturnedNoValidResult"));
  if (!sameIp(result.data.ip, ip))
    throw new Error(t("ip.ipReturnedSourceDoesMatchRequestedAddress"));
  return adaptCoffee(result.data);
}
export const currentIp = (signal?: AbortSignal) =>
  endpoint<Geo>("/me", { signal });

export const ipNetwork = (ip: string, signal?: AbortSignal) =>
  endpoint<IpNetwork>(`/ip/network/${encodeURIComponent(ip)}`, { signal });
