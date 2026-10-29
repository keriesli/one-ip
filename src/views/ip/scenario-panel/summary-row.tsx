import { memo } from "react";
import { Pending } from "@/components/toolkit";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { t } from "@/i18n";
import {
  Info,
  BrainCircuit,
  ShoppingBag,
  MessagesSquare,
  Bitcoin,
  Play,
  Gamepad2,
  Briefcase,
  Code2,
  Cloud,
  Search,
  House,
  Mail,
} from "lucide-react";
import { ScenarioStars } from "./scenario-stars";
import { scenarioGroups, type ScenarioGroup } from "../scenario-targets";

const scenarioIcons = {
  ai: BrainCircuit,
  commerce: ShoppingBag,
  social: MessagesSquare,
  crypto: Bitcoin,
  streaming: Play,
  gaming: Gamepad2,
  remote: Briefcase,
  api: Code2,
  hosting: Cloud,
  search: Search,
  domestic: House,
  communication: Mail,
};

export const platformCount = new Set(
  scenarioGroups.flatMap((group) => group.targets.map((target) => target.url)),
).size;

// Only visible rating/coverage changes rerender a row; raw sample updates stay in the dialog.
export const ScenarioSummaryRow = memo(function ScenarioSummaryRow({
  group,
  average,
  rated,
  dots,
  busy,
  onSelect,
}: {
  group: ScenarioGroup;
  average: number | null;
  rated: number;
  dots: string;
  busy: boolean;
  onSelect: (id: string) => void;
}) {
  const Icon = scenarioIcons[group.id as keyof typeof scenarioIcons];
  const states = dots.split(",");
  const partial = average !== null && rated < group.targets.length;
  return (
    <TableRow
      className="ip-scenario-table-row"
      onClick={() => onSelect(group.id)}
    >
      <TableCell>
        <button
          type="button"
          className="site-cell ip-platform-name"
          aria-haspopup="dialog"
          onClick={(event) => {
            event.stopPropagation();
            onSelect(group.id);
          }}
        >
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <span>{group.label}</span>
        </button>
      </TableCell>
      <TableCell>
        <div className="ip-scenario-progress">
          <div
            className="ping-dots"
            aria-label={t("ip.scenarios.rated", [rated, group.targets.length])}
          >
            {group.targets.map((target, index) => (
              <span
                key={target.url}
                className={`ping-dot ${states[index] === "_" ? "" : states[index] === "!" ? "dot-fail" : "dot-good"}`}
                title={`${target.name} · ${states[index] === "_" ? t("common.checking") : states[index] === "!" ? t("ip.scenarios.insufficientEvidence") : `${states[index]}/5`}`}
              />
            ))}
          </div>
          <span className="ip-scenario-count text-[10px] text-muted-foreground">
            {rated}/{group.targets.length}
          </span>
          <span
            className="ip-scenario-partial"
            data-visible={partial}
            title={partial ? t("ip.scenarios.partialResults") : undefined}
            aria-label={partial ? t("ip.scenarios.partialResults") : undefined}
            aria-hidden={!partial}
          >
            <Info size={11} aria-hidden="true" />
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="ip-scenario-rating">
          {average !== null ? (
            <ScenarioStars stars={average} />
          ) : (
            <Badge variant="secondary">
              {busy ? (
                <Pending>{t("common.checking")}</Pending>
              ) : (
                t("ip.scenarios.insufficientEvidence")
              )}
            </Badge>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
});
