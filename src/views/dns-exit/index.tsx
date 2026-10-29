import { useState } from "react";
import { CountryFlag } from "@/components/country-flag";
import { DataTable } from "@/components/data-table";
import { NumberTicker } from "@/components/number-ticker";
import { OverflowDetailText } from "@/components/overflow-detail-text";
import {
  PageHeading,
  IpText,
  ActionButton,
  ErrorNotice,
  Pending,
} from "@/components/toolkit";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/i18n";
import { countryName } from "@/lib/country";
import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";
import { detectDnsExits, dnsSampleCount, type DnsProgress } from "./api";

type Resolver = DnsProgress["results"][number];
const columns: ColumnDef<Resolver>[] = [
  {
    id: "ip",
    header: t("dns.dnsEgressIp"),
    cell: ({ row }) => <IpText ip={row.original.ip} />,
  },
  {
    accessorKey: "geo",
    header: t("dns.locationIsp"),
    cell: ({ row }) => (
      <span className="flex min-w-0 items-center gap-2">
        <CountryFlag code={row.original.country} />
        <OverflowDetailText
          text={row.original.geo}
          title={t("dns.dnsLocationDetails")}
        />
      </span>
    ),
  },
  {
    id: "sources",
    header: t("dns.detectionSource"),
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1.5">
        {row.original.sources.map((source) => (
          <span
            key={source}
            className="whitespace-nowrap rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
          >
            {source}
          </span>
        ))}
      </div>
    ),
  },
  {
    id: "samples",
    header: t("dns.observations"),
    cell: ({ row }) => <NumberTicker value={row.original.samples} />,
  },
];
function DnsCountrySummary({ results }: { results: Resolver[] }) {
  const groups = new Map<string, Resolver[]>();
  for (const resolver of results) {
    const key = resolver.country ?? "";
    groups.set(key, [...(groups.get(key) ?? []), resolver]);
  }
  if (!groups.size) return null;
  return (
    <section className="dns-country-summary" aria-label={t("dns.resolvedIn")}>
      <h2>{t("dns.resolvedIn")}</h2>
      <div className="dns-country-grid">
        {[...groups]
          .sort(([, a], [, b]) => b.length - a.length)
          .map(([country, items]) => (
            <div className="dns-country-card" key={country || "unknown"}>
              <CountryFlag code={country} size="xl" />
              <div className="min-w-0">
                <strong>
                  {countryName(country) ?? t("common.unknownRegion")}
                </strong>
                <span>
                  {[...new Set(items.flatMap((item) => item.isp ?? []))]
                    .slice(0, 3)
                    .join(" · ") || "—"}
                </span>
              </div>
              <span className="dns-country-count">
                {t("dns.resolverCount", [items.length])}
              </span>
            </div>
          ))}
      </div>
    </section>
  );
}

export default function DnsExitPage() {
  const [round, setRound] = useState(0);
  const client = useQueryClient();
  const progressKey = ["dns-exit-progress", round];
  const progress = useQuery<DnsProgress>({
    queryKey: progressKey,
    enabled: false,
    queryFn: skipToken,
  });
  const query = useQuery({
    queryKey: ["dns-exit", round],
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: ({ signal }) =>
      detectDnsExits(signal, (state) => {
        client.setQueryData(progressKey, state);
      }),
  });
  const state = query.isFetching
    ? progress.data
    : (query.data ?? progress.data);
  return (
    <>
      <PageHeading title={t("dns.dnsEgressLookup")} />
      <div className="toolbar">
        <ActionButton
          busy={query.isFetching}
          onClick={() => setRound((n) => n + 1)}
        >
          {query.isFetching ? t("common.checkingDots") : t("common.runAgain")}
        </ActionButton>
        <span className="small muted">
          <NumberTicker value={state?.count ?? 0} />/{dnsSampleCount}{" "}
          {t("dns.samples")} {state?.failed ?? 0} {t("dns.failures")}
        </span>
      </div>
      <ErrorNotice error={query.error} />
      {state && state.failed > 0 && (
        <p className="small muted mb-3">
          {t("dns.someProbesFailedDoesMeanThereDnsLeaks")}{" "}
          {Object.entries(state.failures)
            .map(([source, count]) => `${source}: ${count}`)
            .join(" · ")}
        </p>
      )}
      <DnsCountrySummary results={state?.results ?? []} />
      <Card>
        <CardContent>
          <DataTable
            className="dns-exit-table"
            data={state?.results ?? []}
            columns={columns}
            getRowId={(row) => row.ip}
            animateChanges={false}
            animateEntries
            empty={
              query.isFetching ? (
                <Pending>{t("dns.waitingForResolutionResults")}</Pending>
              ) : (
                t("dns.noDnsEgressDetected")
              )
            }
          />
        </CardContent>
      </Card>
      <p className="small muted mt-3">
        {t("dns.identicalEgressAddressesMergedTheirCountDependsActual")}
      </p>
    </>
  );
}
