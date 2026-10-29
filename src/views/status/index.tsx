import { useSearchParams } from "react-router-dom";
import { DataTable } from "@/components/data-table";
import { NumberTicker } from "@/components/number-ticker";
import { PageHeading, Pending, ToolCard } from "@/components/toolkit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { t, locale } from "@/i18n";
import { useQueries } from "@tanstack/react-query";
import { getStatus } from "./api";
import { MobileStatusList } from "./components/mobile-status-list";
import { ServiceDetailDialog } from "./components/service-detail-dialog";
import { statusColumns } from "./components/status-columns";
import { serviceGroups } from "./groups";
import { statusOrder } from "./order";
import { services, toTableRow } from "./rows";

export default function StatusPage() {
  const mobile = useIsMobile();
  const [params, setParams] = useSearchParams();
  const requestedService = params.get("service");
  const detailId = services.some((service) => service.id === requestedService)
    ? requestedService
    : null;
  const setDetailId = (id: string | null) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (id) next.set("service", id);
        else next.delete("service");
        return next;
      },
      { replace: id === null },
    );
  };
  const filter = params.get("group") ?? "全部";
  const queries = useQueries({
    queries: services.map((s) => ({
      queryKey: ["service-status", s.id],
      enabled: Boolean(s.url),
      queryFn: ({ signal }: { signal: AbortSignal }) => getStatus(s.id, signal),
      retry: false,
      staleTime: 60_000,
      refetchInterval: 120_000,
    })),
  });
  const pending = queries.some((q) => q.isFetching);
  const rows = services
    .map((service, i) => ({ ...service, query: queries[i] }))
    .filter((s) => filter === "全部" || s.group === filter);
  const sections = [
    [
      t("status.incidentsMaintenance"),
      rows
        .filter(
          (s) =>
            !s.query.isError &&
            statusOrder(s.query.data?.status?.indicator) === 0,
        )
        .sort((a, b) => {
          const severity = ["critical", "major", "minor", "maintenance"];
          return (
            severity.indexOf(a.query.data!.status.indicator) -
            severity.indexOf(b.query.data!.status.indicator)
          );
        }),
    ],
    [
      t("status.operational"),
      rows.filter(
        (s) => !s.query.isError && s.query.data?.status?.indicator === "none",
      ),
    ],
    [
      t("common.pendingConfirmation"),
      rows.filter(
        (s) =>
          s.query.isError || statusOrder(s.query.data?.status?.indicator) === 2,
      ),
    ],
  ] as const;
  const tableRows = sections.flatMap(([, items]) => items.map(toTableRow));
  const columns = statusColumns(setDetailId);
  const detail = tableRows.find((service) => service.id === detailId);
  return (
    <div className="service-status-page">
      <PageHeading title={t("navigation.serviceStatus")} />
      <div className="toolbar">
        <div className="filter-tabs">
          {serviceGroups.map(({ value: group, label }) => (
            <Button
              size="sm"
              variant={group === filter ? "secondary" : "ghost"}
              key={group}
              onClick={() => setParams(group === "全部" ? {} : { group })}
            >
              {label}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          aria-busy={pending}
          onClick={() => {
            void Promise.all(
              queries
                .filter((_, index) => services[index].url)
                .map((q) => q.refetch()),
            );
          }}
        >
          {pending ? (
            <Pending>{t("status.refreshing")}</Pending>
          ) : (
            t("status.refreshStatus")
          )}
        </Button>
      </div>
      <div className="service-summary">
        {sections.map(([label, items], index) => (
          <ToolCard
            key={label}
            title={
              <span className="block truncate" title={label}>
                {locale === "en"
                  ? ["Issues", "Healthy", "Unknown"][index]
                  : label}
              </span>
            }
            className={`service-summary-card summary-${index}`}
          >
            <div className="service-summary-number">
              <NumberTicker value={items.length} />
              <span>{t("status.services")}</span>
            </div>
          </ToolCard>
        ))}
      </div>
      {mobile ? (
        <MobileStatusList sections={sections} setDetailId={setDetailId} />
      ) : (
        <div className="service-table">
          <Card>
            <CardContent>
              <DataTable
                data={tableRows}
                columns={columns}
                getRowId={(row) => row.id}
                animateChanges={false}
                empty={t("status.noServices")}
              />
            </CardContent>
          </Card>
        </div>
      )}
      <p className="small muted">
        {t("status.checksAutomaticallyEvery2MinutesUnknownFailedQueries")}
      </p>
      <ServiceDetailDialog
        detail={detail}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}
