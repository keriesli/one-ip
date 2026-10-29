import { t } from "@/i18n";
import { asnLabel, itemName, shareLabel } from "./layout";
import { type RouteItem, type RouteTopology } from "./types";

export function RouteList({
  topology,
  currentAsn,
  currentAsnName,
}: {
  topology: RouteTopology;
  currentAsn?: number;
  currentAsnName?: string;
}) {
  const row = (item: RouteItem, secondary = false, showShare = true) => (
    <div
      key={`${secondary ? "secondary" : "direct"}-${item.asn}`}
      className={`ip-route-list-row${item.tier1 ? " is-tier1" : ""}${showShare ? "" : " is-origin"}`}
    >
      <div className="ip-route-list-main">
        <strong>{asnLabel(item.asn)}</strong>
        <span>
          {itemName(item, currentAsn, currentAsnName)}
          {secondary && item.via?.length ? (
            <small>{t("ip.via", [item.via.map(asnLabel).join(" / ")])}</small>
          ) : null}
        </span>
      </div>
      {showShare && (
        <>
          <em>{shareLabel(item.share)}</em>
          <i style={{ width: `${Math.min(100, Math.max(0, item.share))}%` }} />
        </>
      )}
    </div>
  );

  return (
    <div className="ip-route-graph-list" aria-label={t("ip.routePathDetails")}>
      <div className="ip-route-list-heading">{t("ip.originAs")}</div>
      {topology.origins.map((item) => row(item, false, false))}
      <div className="ip-route-list-heading">
        {t("ip.directUpstreamPathShare")}
      </div>
      {topology.direct.map((item) => row(item))}
      {!!topology.secondary.length && (
        <>
          <div className="ip-route-list-heading">
            {t("ip.secondLevelUpstreamBlueTier1Label")}
          </div>
          {topology.secondary.map((item) => row(item, true))}
        </>
      )}
    </div>
  );
}
