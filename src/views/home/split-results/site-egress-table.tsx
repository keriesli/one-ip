import { useId, useLayoutEffect, useRef, useState } from "react";
import { CompactText } from "@/components/compact-text";
import { CountryFlag } from "@/components/country-flag";
import { SiteLogo } from "@/components/site-logo";
import { IpText, Pending } from "@/components/toolkit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/i18n";
import type { Geo } from "@/lib/types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { type Site } from "../api";
import { type SiteFilter } from "../exit-groups";
import { siteCategoryLabels } from "../site-categories";

export interface Row extends Site {
  onDetail: (name: string) => void;
  visible: boolean;
  geo?: Geo;
  pending: boolean;
  reachable?: boolean;
  geoPending: boolean;
}

export function SiteEgressTable({
  rows,
  filter,
  onClearFilter,
}: {
  rows: Row[];
  filter: SiteFilter | null;
  onClearFilter: () => void;
}) {
  const tableId = useId();
  const [expanded, setExpanded] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const restoreToggle = useRef(false);
  const canToggle = rows.length > 5;
  const collapsed = canToggle && !expanded;
  const visibleRows = collapsed ? rows.slice(0, 6) : rows;
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const table = tableRef.current;
    const body = bodyRef.current;
    if (!viewport || !table || !body) return;
    const resize = () => {
      const preview = body.rows[5];
      viewport.style.height =
        collapsed && preview
          ? `${preview.getBoundingClientRect().top - table.getBoundingClientRect().top + 56}px`
          : "";
    };
    resize();
    if (restoreToggle.current) {
      restoreToggle.current = false;
      toggleRef.current?.scrollIntoView({
        block: "end",
        behavior: "instant",
      });
    }
    const observer = new ResizeObserver(resize);
    observer.observe(table);
    return () => observer.disconnect();
  }, [collapsed, rows.length]);
  return (
    <Card className="split-table-card mb-3 gap-0 rounded-lg py-0">
      <CardHeader className="split-table-header">
        <div className="row-between gap-2">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <CardTitle>{t("home.websiteAccessDetails")}</CardTitle>
              <span className="split-table-count">
                {rows.length} {t("home.sites")}
              </span>
            </div>
            {filter && (
              <p className="split-table-filter">
                {t(filter.kind === "site" ? "common.website" : "common.ip")} ·{" "}
                {filter.value}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {filter && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={onClearFilter}
              >
                {t("home.clearFilter")}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative p-0" data-collapsed={collapsed}>
        <div
          ref={viewportRef}
          className="split-table-viewport"
          data-expanded={expanded || !canToggle}
        >
          <div className="data-table split-table">
            <table ref={tableRef} id={tableId}>
              <thead>
                <tr>
                  <th>{t("common.website")}</th>
                  <th>{t("home.accessStatus")}</th>
                  <th>{t("common.ip")}</th>
                  <th>{t("common.location")}</th>
                </tr>
              </thead>
              <tbody ref={bodyRef}>
                {visibleRows.map((row, index) => {
                  const location = row.geo
                    ? [
                        row.geo.country,
                        row.geo.region,
                        row.geo.city,
                        row.geo.isp,
                        row.geo.asn
                          ? `AS${String(row.geo.asn).replace(/^AS/i, "")}`
                          : undefined,
                      ]
                        .filter(Boolean)
                        .filter(
                          (value, index, all) => all.indexOf(value) === index,
                        )
                        .join(" · ")
                    : "";
                  const status = row.pending
                    ? t("common.checking")
                    : row.reachable === false
                      ? t("home.websiteAccessBlockedLabel")
                      : row.reachable === true
                        ? t("home.websiteReachable")
                        : t("home.waitingToCheck");
                  return (
                    <tr key={row.name} inert={collapsed && index >= 5}>
                      <td>
                        <button
                          type="button"
                          className="site-cell w-full overflow-hidden text-left hover:text-primary"
                          title={status}
                          onClick={() => row.onDetail(row.name)}
                        >
                          <SiteLogo src={row.icon} />
                          <span className="min-w-0 truncate">{row.name}</span>
                          <Badge
                            variant="secondary"
                            className={
                              row.type === "domestic"
                                ? "tag-domestic"
                                : "tag-international"
                            }
                          >
                            {t(
                              row.type === "domestic"
                                ? "categories.domestic"
                                : "categories.international",
                            )}
                          </Badge>
                          {row.extra?.map((category) => (
                            <Badge key={category} variant="secondary">
                              {siteCategoryLabels[category] ?? category}
                            </Badge>
                          ))}
                        </button>
                      </td>
                      <td>
                        {row.pending ? (
                          <Pending>{t("common.checking")}</Pending>
                        ) : row.reachable === false ? (
                          <span className="text-destructive">
                            {t("home.websiteAccessBlockedLabel")}
                          </span>
                        ) : row.reachable === true ? (
                          <span className="text-success">
                            {t("home.websiteReachable")}
                          </span>
                        ) : (
                          <span className="muted">
                            {t("home.waitingToCheck")}
                          </span>
                        )}
                      </td>
                      <td>
                        {row.geo ? (
                          <IpText ip={row.geo.ip} />
                        ) : row.reachable === true ? (
                          <span className="muted">
                            {t("home.egressUnavailable")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {row.geoPending ? (
                          <Pending>{t("common.lookingUpEllipsis")}</Pending>
                        ) : location ? (
                          <div className="flex min-w-0 items-center gap-1.5">
                            <CountryFlag code={row.geo?.country_code} />
                            <CompactText text={location} />
                          </div>
                        ) : (
                          <span className="muted">
                            {t("common.locationDetailsAreUnavailable")}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {canToggle && (
          <div className="split-table-toggle">
            <Button
              ref={toggleRef}
              type="button"
              size="sm"
              variant="ghost"
              className="min-h-11 w-full gap-1"
              aria-expanded={expanded}
              aria-controls={tableId}
              onClick={() => {
                restoreToggle.current = expanded;
                setExpanded((value) => !value);
              }}
            >
              {expanded ? (
                <ChevronUp aria-hidden="true" />
              ) : (
                <ChevronDown aria-hidden="true" />
              )}
              {expanded ? t("home.collapseAll") : t("home.expandAll")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
