import { t } from "@/i18n";
import { maskedIp } from "@/lib/network";
import { hideIpAtom } from "@/store/privacy";
import { useAtomValue } from "jotai";
import { GraphNode } from "./graph-node";
import {
  DIRECT_WIDTH,
  DIRECT_X,
  GRAPH_WIDTH,
  NODE_HEIGHT,
  ORIGIN_WIDTH,
  ORIGIN_X,
  SECONDARY_WIDTH,
  SECONDARY_X,
  asnLabel,
  columnY,
  curvePath,
  graphHeight,
  nodeCenterY,
} from "./layout";

export function AnnouncementChart({
  ip,
  prefix,
  asns,
  currentAsn,
  currentAsnName,
}: {
  ip: string;
  prefix: string;
  asns: string[];
  currentAsn?: number;
  currentAsnName?: string;
}) {
  const hidden = useAtomValue(hideIpAtom);
  const displayIp = maskedIp(ip, hidden);
  const height = graphHeight(asns.length);
  const centerY = height / 2 - NODE_HEIGHT / 2;

  return (
    <div className="ip-route-graph-wrap">
      <svg
        className="ip-route-graph-svg"
        viewBox={`0 0 ${GRAPH_WIDTH} ${height}`}
        role="img"
        aria-label={t("ip.bgpAnnouncementsFor", [displayIp])}
      >
        <text x={ORIGIN_X} y="16" className="ip-route-column-label">
          {t("ip.queriedIp")}
        </text>
        <text x={DIRECT_X} y="16" className="ip-route-column-label">
          {t("ip.bgpPrefix")}
        </text>
        <text x={SECONDARY_X} y="16" className="ip-route-column-label">
          {t("ip.announcingAsn")}
        </text>
        <g className="ip-route-graph-edges" aria-hidden="true">
          <path
            className="ip-route-edge"
            d={curvePath(
              ORIGIN_X + ORIGIN_WIDTH,
              nodeCenterY(centerY),
              DIRECT_X,
              nodeCenterY(centerY),
            )}
            style={{ strokeWidth: 1.5 }}
          />
          {asns.map((asn, index) => (
            <path
              key={asn}
              className="ip-route-edge"
              d={curvePath(
                DIRECT_X + DIRECT_WIDTH,
                nodeCenterY(centerY),
                SECONDARY_X,
                nodeCenterY(columnY(asns.length, index, height)),
              )}
              style={{ strokeWidth: 1.2 }}
            />
          ))}
        </g>
        <GraphNode
          x={ORIGIN_X}
          y={centerY}
          width={ORIGIN_WIDTH}
          eyebrow={t("ip.queriedIp")}
          title={displayIp}
          className="is-origin"
        />
        <GraphNode
          x={DIRECT_X}
          y={centerY}
          width={DIRECT_WIDTH}
          eyebrow={t("ip.bgpPrefix")}
          title={prefix}
          className="is-prefix"
        />
        {asns.map((asn, index) => (
          <GraphNode
            key={asn}
            x={SECONDARY_X}
            y={columnY(asns.length, index, height)}
            width={SECONDARY_WIDTH}
            eyebrow={
              asn === String(currentAsn)
                ? t("ip.currentAsn")
                : t("ip.announcingAsn")
            }
            title={
              asn === String(currentAsn) && currentAsnName
                ? `${asnLabel(asn)} · ${currentAsnName}`
                : asnLabel(asn)
            }
            className={asn === String(currentAsn) ? "is-current" : ""}
          />
        ))}
      </svg>
    </div>
  );
}
