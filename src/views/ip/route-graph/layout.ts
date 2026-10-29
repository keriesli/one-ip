import { t } from "@/i18n";
import { type RouteItem } from "./types";

export const GRAPH_WIDTH = 980;
export const NODE_HEIGHT = 46;
const COLUMN_TOP = 30;
const COLUMN_BOTTOM_GAP = 56;
export const ORIGIN_X = 20;
export const ORIGIN_WIDTH = 190;
export const DIRECT_X = 330;
export const DIRECT_WIDTH = 176;
export const SECONDARY_X = 700;
export const SECONDARY_WIDTH = 200;

export function validationLabel(status: string) {
  switch (status.toLowerCase()) {
    case "valid":
      return t("ip.valid");
    case "invalid":
      return t("ip.invalid");
    case "notfound":
    case "unknown":
      return t("ip.noRoaPublished");
    default:
      return t("common.unknown");
  }
}

export function graphHeight(...counts: number[]) {
  const rows = Math.max(1, ...counts);
  return Math.max(260, 84 + (rows - 1) * 60);
}

export function columnY(count: number, index: number, height: number) {
  if (count <= 1) return height / 2 - NODE_HEIGHT / 2;
  const last = height - COLUMN_BOTTOM_GAP - NODE_HEIGHT;
  return COLUMN_TOP + (index * (last - COLUMN_TOP)) / (count - 1);
}

export function nodeCenterY(y: number) {
  return y + NODE_HEIGHT / 2;
}

export function curvePath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
) {
  const middleX = sourceX + (targetX - sourceX) / 2;
  return `M ${sourceX} ${sourceY} C ${middleX} ${sourceY}, ${middleX} ${targetY}, ${targetX} ${targetY}`;
}

export function truncateLabel(value: string, length: number) {
  const chars = Array.from(value);
  return chars.length > length
    ? `${chars.slice(0, length - 1).join("")}…`
    : value;
}

export function itemName(
  item: Pick<RouteItem, "name" | "asn">,
  currentAsn?: number,
  currentAsnName?: string,
) {
  const current = currentAsn == null ? undefined : String(currentAsn);
  return (
    item.name?.trim() ||
    (item.asn === current ? currentAsnName?.trim() : undefined) ||
    t("common.unknown")
  );
}

export function asnLabel(asn: string) {
  return asn.toUpperCase().startsWith("AS") ? asn : `AS${asn}`;
}

export function shareLabel(value: number) {
  return Number.isFinite(value)
    ? `${value.toFixed(1).replace(/\.0$/, "")}%`
    : "—";
}

export function edgeWidth(share: number) {
  return 1.2 + Math.min(80, Math.max(0, share)) * 0.08;
}

export function snapshotDate(value?: string | number) {
  if (!value) return t("common.current");
  const timestamp =
    typeof value === "number" && value < 1_000_000_000_000
      ? value * 1000
      : value;
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? t("common.current")
    : new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
}
