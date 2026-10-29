import { useState } from "react";
import { Pending, ToolCard } from "@/components/toolkit";
import { t } from "@/i18n";
import { useQuery } from "@tanstack/react-query";
import { AnnouncementChart } from "./announcement-chart";
import { snapshotDate, validationLabel } from "./layout";
import { RouteList } from "./route-list";
import { RouteTopologyChart } from "./topology-chart";
import { ipNetwork } from "../api";

export default function IpRouteGraph({
  ip,
  currentAsn,
  currentAsnName,
}: {
  ip: string;
  currentAsn?: number;
  currentAsnName?: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const network = useQuery({
    queryKey: ["ip-network", ip],
    queryFn: ({ signal }) => ipNetwork(ip, signal),
    staleTime: 300_000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const data = network.data;
  const asns = [
    ...new Set((data?.asns ?? []).map(String).filter((asn) => asn.length > 0)),
  ];
  const topology = data?.topology;
  const title = (
    <div className="ip-route-graph-heading">
      <span className="ip-route-graph-heading-title">
        {t("ip.bgpRouteTopology")}
      </span>
      <button
        type="button"
        className="ip-route-graph-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? t("common.collapse") : t("common.expand")}
      </button>
      {topology && (
        <span className="ip-route-graph-heading-sub">
          {data?.prefix} · {topology.observedPaths.toLocaleString()}{" "}
          {t("ip.observedPaths")}
        </span>
      )}
    </div>
  );

  return (
    <ToolCard title={title}>
      {expanded &&
        (network.isPending ? (
          <div className="ip-route-graph-state">
            <Pending>{t("ip.readingRoutingData")}</Pending>
          </div>
        ) : network.isError || !data?.routeAvailable || !data.prefix ? (
          <p className="ip-route-graph-state text-muted-foreground">
            {t("ip.routingDataUnavailable")}
          </p>
        ) : topology ? (
          <>
            <div className="ip-route-graph-snapshots">
              <button
                type="button"
                className="ip-route-graph-snapshot"
                aria-current="true"
                disabled
              >
                <span>{snapshotDate(topology.queryTime)}</span>
                <small>
                  {t("ip.currentUpstreams", [topology.direct.length])}
                </small>
              </button>
            </div>
            <RouteTopologyChart
              topology={topology}
              currentAsn={currentAsn}
              currentAsnName={currentAsnName}
            />
            <RouteList
              topology={topology}
              currentAsn={currentAsn}
              currentAsnName={currentAsnName}
            />
            {!!data.validations?.length && (
              <div className="ip-route-graph-validations">
                {data.validations.map((validation) => (
                  <span key={validation.asn}>
                    AS{validation.asn} · {validationLabel(validation.status)}
                  </span>
                ))}
              </div>
            )}
            <p className="ip-route-graph-note">
              {t("ip.currentSnapshotComesRipeRisLineWidthShows")}
            </p>
          </>
        ) : (
          <>
            <div className="ip-route-graph-summary">
              <div className="min-w-0">
                <strong className="block truncate">{data.prefix}</strong>
                <span>
                  {data.source ?? "RIPE RIS / RIPEstat"}
                  {data.ptr ? ` · PTR ${data.ptr}` : ""}
                </span>
              </div>
              <span className="shrink-0">
                {asns.length} {t("ip.announcingAsns")}
              </span>
            </div>
            <AnnouncementChart
              ip={ip}
              prefix={data.prefix}
              asns={asns}
              currentAsn={currentAsn}
              currentAsnName={currentAsnName}
            />
            {!!data.validations?.length && (
              <div className="ip-route-graph-validations">
                {data.validations.map((validation) => (
                  <span key={validation.asn}>
                    AS{validation.asn} · {validationLabel(validation.status)}
                  </span>
                ))}
              </div>
            )}
            <p className="ip-route-graph-note">
              {t("ip.sourceReturnsBgpPrefixAnnouncingAsnsCompletePath")}
            </p>
          </>
        ))}
    </ToolCard>
  );
}
