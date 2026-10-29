import { AnimatedValue } from "@/components/animated-value";
import { SiteLogo } from "@/components/site-logo";
import { Pending } from "@/components/toolkit";
import { Badge } from "@/components/ui/badge";
import { UnderlineHover } from "@/components/underline-hover";
import { locale, t } from "@/i18n";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";
import { serviceGroupLabel } from "../groups";
import { indicatorLabels, type StatusRow } from "../rows";

export function statusColumns(
  setDetailId: (id: string) => void,
): ColumnDef<StatusRow>[] {
  return [
    {
      accessorKey: "name",
      header: t("status.service"),
      cell: ({ row }) => (
        <button
          type="button"
          className="service-name text-left text-primary focus-visible:outline-ring"
          onClick={() => setDetailId(row.original.id)}
          aria-label={t("common.viewDetails", [row.original.name])}
        >
          <SiteLogo src={row.original.icon} website={row.original.page} />
          <UnderlineHover className="truncate">
            {row.original.name}
          </UnderlineHover>
          {!!row.original.data?.incidents?.length && (
            <Badge variant="secondary" className="shrink-0">
              {row.original.data.incidents.length}
              {t("status.incidents")}
            </Badge>
          )}
        </button>
      ),
    },
    {
      accessorKey: "group",
      header: t("status.category"),
      cell: ({ row }) => (
        <Badge variant="secondary">
          {serviceGroupLabel(row.original.group)}
        </Badge>
      ),
    },
    {
      id: "status",
      header: t("common.status"),
      cell: ({ row }) => {
        const service = row.original;
        const indicator = service.data?.status?.indicator;
        return (
          <button
            type="button"
            onClick={() => setDetailId(service.id)}
            aria-label={t("status.viewStatusDetails", [service.name])}
            title={service.error}
            className={`service-table-state service-card service-${service.failed ? "unknown" : (indicator ?? "unknown")}`}
          >
            <i
              className={`service-dot ${service.fetching ? "service-dot-loading" : ""}`}
            />
            <span className="flex flex-col items-start gap-0.5">
              <AnimatedValue
                value={`${service.loading}-${service.failed}-${indicator}`}
              >
                {service.loading ? (
                  <Pending>{t("common.lookingUp")}</Pending>
                ) : !service.integrated ? (
                  t("status.notIntegrated")
                ) : service.failed ? (
                  t(
                    service.data
                      ? "status.updateFailed"
                      : "status.lookupFailed",
                  )
                ) : (
                  (indicatorLabels[indicator ?? ""] ?? t("common.unknown"))
                )}
              </AnimatedValue>
              {service.failed && service.data && (
                <span className="text-xs font-normal text-muted-foreground">
                  {t("status.lastKnownStatus", [
                    indicatorLabels[indicator ?? ""] ?? t("common.unknown"),
                  ])}
                </span>
              )}
            </span>
          </button>
        );
      },
    },
    {
      id: "updated",
      header: t("status.updatedAt"),
      cell: ({ row }) =>
        row.original.data?.fetchedAt ? (
          <time
            className="small muted"
            dateTime={row.original.data.fetchedAt}
            title={new Date(row.original.data.fetchedAt).toLocaleString(locale)}
          >
            {row.original.failed
              ? t("status.lastSuccessfulUpdate", [
                  new Date(row.original.data.fetchedAt).toLocaleTimeString(
                    locale,
                  ),
                ])
              : new Date(row.original.data.fetchedAt).toLocaleTimeString(
                  locale,
                )}
          </time>
        ) : (
          <span className="small muted">—</span>
        ),
    },
    {
      id: "action",
      header: "",
      cell: ({ row }) => (
        <UnderlineHover asChild>
          <a
            href={row.original.page}
            target="_blank"
            rel="noreferrer"
            className="small"
          >
            {row.original.statusSource
              ? t("status.thirdParty", [row.original.statusSource])
              : row.original.officialStatus
                ? t("status.officialStatus")
                : t("status.platformWebsite")}
          </a>
        </UnderlineHover>
      ),
    },
  ];
}
