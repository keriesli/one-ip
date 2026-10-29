import { NODE_HEIGHT, truncateLabel } from "./layout";

export function GraphNode({
  x,
  y,
  width,
  eyebrow,
  title,
  className = "",
}: {
  x: number;
  y: number;
  width: number;
  eyebrow: string;
  title: string;
  className?: string;
}) {
  return (
    <g
      className={`ip-route-node ${className}`}
      transform={`translate(${x},${y})`}
    >
      <rect width={width} height={NODE_HEIGHT} rx="8" />
      <text x="12" y="19" className="ip-route-node-key">
        {truncateLabel(eyebrow, 25)}
      </text>
      <text x="12" y="36" className="ip-route-node-name">
        {truncateLabel(title, width < 190 ? 24 : 28)}
      </text>
    </g>
  );
}
