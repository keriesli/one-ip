import { t } from "@/i18n";
import { GraphNode } from "./graph-node";
import {
  DIRECT_WIDTH,
  DIRECT_X,
  GRAPH_WIDTH,
  ORIGIN_WIDTH,
  ORIGIN_X,
  SECONDARY_WIDTH,
  SECONDARY_X,
  asnLabel,
  columnY,
  curvePath,
  edgeWidth,
  graphHeight,
  itemName,
  nodeCenterY,
  shareLabel,
} from "./layout";
import { type RouteTopology } from "./types";

export function RouteTopologyChart({
  topology,
  currentAsn,
  currentAsnName,
}: {
  topology: RouteTopology;
  currentAsn?: number;
  currentAsnName?: string;
}) {
  const origins = topology.origins;
  const direct = topology.direct;
  const secondary = topology.secondary;
  const height = graphHeight(origins.length, direct.length, secondary.length);
  const originPositions = new Map(
    origins.map((item, index) => [
      item.asn,
      columnY(origins.length, index, height),
    ]),
  );
  const directPositions = new Map(
    direct.map((item, index) => [
      item.asn,
      columnY(direct.length, index, height),
    ]),
  );
  const secondaryPositions = new Map(
    secondary.map((item, index) => [
      item.asn,
      columnY(secondary.length, index, height),
    ]),
  );
  const directByAsn = new Map(direct.map((item) => [item.asn, item]));
  const current = currentAsn == null ? undefined : String(currentAsn);

  return (
    <div className="ip-route-graph-wrap">
      <svg
        className="ip-route-graph-svg"
        viewBox={`0 0 ${GRAPH_WIDTH} ${height}`}
        role="img"
        aria-label={t("ip.bgpAnnouncementsFor", [
          topology.origins.map((item) => asnLabel(item.asn)).join("、"),
        ])}
      >
        <text x={ORIGIN_X} y="16" className="ip-route-column-label">
          {t("ip.originAs")}
        </text>
        <text x={DIRECT_X} y="16" className="ip-route-column-label">
          {t("ip.directUpstreamPathShare")}
        </text>
        <text x={SECONDARY_X} y="16" className="ip-route-column-label">
          {t("ip.secondLevelUpstreamBlueTier1")}
        </text>

        <g className="ip-route-graph-edges" aria-hidden="true">
          {topology.edges.map((edge) => {
            const originY = originPositions.get(edge.origin);
            const directY = directPositions.get(edge.direct);
            if (originY == null || directY == null) return null;
            const tier1 = directByAsn.get(edge.direct)?.tier1;
            const sourceY = nodeCenterY(originY);
            const targetY = nodeCenterY(directY);
            return (
              <g key={`${edge.origin}-${edge.direct}`}>
                <path
                  className={`ip-route-edge${tier1 ? " is-tier1" : ""}`}
                  d={curvePath(
                    ORIGIN_X + ORIGIN_WIDTH,
                    sourceY,
                    DIRECT_X,
                    targetY,
                  )}
                  style={{ strokeWidth: edgeWidth(edge.share) }}
                />
                <text
                  className="ip-route-edge-label"
                  x={(ORIGIN_X + ORIGIN_WIDTH + DIRECT_X) / 2}
                  y={(sourceY + targetY) / 2 - 6}
                  textAnchor="middle"
                >
                  {shareLabel(edge.share)}
                </text>
              </g>
            );
          })}
          {topology.secondaryEdges.map((edge) => {
            const directY = directPositions.get(edge.direct);
            const secondaryY = secondaryPositions.get(edge.secondary);
            if (directY == null || secondaryY == null) return null;
            const tier1 = secondary.find(
              (item) => item.asn === edge.secondary,
            )?.tier1;
            return (
              <path
                key={`${edge.direct}-${edge.secondary}`}
                className={`ip-route-edge${tier1 ? " is-tier1" : ""}`}
                d={curvePath(
                  DIRECT_X + DIRECT_WIDTH,
                  nodeCenterY(directY),
                  SECONDARY_X,
                  nodeCenterY(secondaryY),
                )}
                style={{ strokeWidth: edgeWidth(edge.share) }}
              />
            );
          })}
        </g>

        <g>
          {origins.map((item, index) => (
            <GraphNode
              key={item.asn}
              x={ORIGIN_X}
              y={columnY(origins.length, index, height)}
              width={ORIGIN_WIDTH}
              eyebrow={asnLabel(item.asn)}
              title={itemName(item, currentAsn, currentAsnName)}
              className={`is-origin${item.asn === current ? " is-current" : ""}`}
            />
          ))}
          {direct.map((item, index) => (
            <GraphNode
              key={item.asn}
              x={DIRECT_X}
              y={columnY(direct.length, index, height)}
              width={DIRECT_WIDTH}
              eyebrow={asnLabel(item.asn)}
              title={itemName(item, currentAsn, currentAsnName)}
              className={`${item.tier1 ? "is-tier1" : ""}${item.asn === current ? " is-current" : ""}`}
            />
          ))}
          {secondary.map((item, index) => (
            <GraphNode
              key={item.asn}
              x={SECONDARY_X}
              y={columnY(secondary.length, index, height)}
              width={SECONDARY_WIDTH}
              eyebrow={asnLabel(item.asn)}
              title={itemName(item, currentAsn, currentAsnName)}
              className={`${item.tier1 ? "is-tier1" : ""}${item.asn === current ? " is-current" : ""}`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
