import { Fragment, useState } from "react";
import { LatencyBadge } from "@/components/latency-badge";
import { SiteLogo } from "@/components/site-logo";
import { Pending } from "@/components/toolkit";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { t } from "@/i18n";
import { EvidenceDetails } from "./evidence-details";
import { ScenarioStars } from "./scenario-stars";
import { accessRating, type Evidence } from "../scenario-evidence";
import { type ScenarioTarget } from "../scenario-targets";

export function AccessRows({
  targets,
  records,
  ip,
  now,
}: {
  targets: ScenarioTarget[];
  records: Record<string, Evidence>;
  ip: string;
  now: number;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className="data-table connectivity-table ip-platform-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("common.website")}</TableHead>
            <TableHead>{t("common.testHistory")}</TableHead>
            <TableHead>{t("common.latency")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {targets.map((target, index) => {
            const evidence = records[target.url];
            const rating = accessRating(evidence, ip, now);
            const running = !evidence || evidence.state === "running";
            const status = rating.stale
              ? t("ip.scenarios.expired")
              : evidence?.state === "cancelled"
                ? t("common.cancelled")
                : evidence?.state === "rate-limited"
                  ? t("ip.scenarios.rateLimited")
                  : evidence?.state === "failed"
                    ? t("ip.scenarios.requestRefused")
                    : rating.responses
                      ? rating.fluctuating
                        ? t("ip.scenarios.inconsistentResponses")
                        : t("ip.scenarios.responseReceived")
                      : running
                        ? t("common.checking")
                        : evidence?.samples.some(
                              (sample) => sample.error === "network",
                            )
                          ? t("ip.scenarios.probeBlocked")
                          : t("ip.scenarios.probeTimedOut");
            const open = expanded === target.url;
            const toggle = () => setExpanded(open ? null : target.url);
            return (
              <Fragment key={target.url}>
                <TableRow
                  data-alt={index % 2}
                  className="ip-platform-row"
                  onClick={toggle}
                >
                  <TableCell>
                    <button
                      type="button"
                      className="site-cell ip-platform-name"
                      aria-expanded={open}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggle();
                      }}
                    >
                      <SiteLogo
                        src={target.icon}
                        website={target.website ?? target.url}
                      />
                      <span>{target.name}</span>
                    </button>
                  </TableCell>
                  <TableCell>
                    <div
                      className="ping-dots"
                      aria-label={t("ip.scenarios.responses", [
                        rating.responses,
                        rating.total,
                      ])}
                    >
                      {Array.from({ length: 8 }, (_, sampleIndex) => {
                        const sample = evidence?.samples[sampleIndex];
                        const good =
                          sample &&
                          ["readable", "opaque"].includes(sample.outcome);
                        return (
                          <span
                            key={sampleIndex}
                            className={`ping-dot ${!sample ? "" : !good ? "dot-fail" : sample.elapsedMs < 100 ? "dot-good" : sample.elapsedMs < 400 ? "dot-warn" : "dot-slow"}`}
                            title={
                              !sample
                                ? t("ip.scenarios.notSampled")
                                : good
                                  ? `${sample.elapsedMs} ms · ${sample.status ? `HTTP ${sample.status}` : t("ip.scenarios.opaqueResponse")}`
                                  : sample.status
                                    ? `HTTP ${sample.status}`
                                    : t("ip.scenarios.probeBlocked")
                            }
                          />
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {rating.median !== null &&
                    !rating.stale &&
                    !["failed", "rate-limited", "cancelled"].includes(
                      evidence?.state ?? "",
                    ) ? (
                      <LatencyBadge
                        result={{
                          median: rating.median,
                          samples: evidence!.samples.map((sample) =>
                            ["opaque", "readable"].includes(sample.outcome)
                              ? sample.elapsedMs
                              : -1,
                          ),
                        }}
                        running={running}
                      />
                    ) : (
                      <Badge variant={running ? "secondary" : "warning"}>
                        {running ? <Pending>{status}</Pending> : status}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
                {open && (
                  <TableRow className="ip-platform-evidence">
                    <TableCell colSpan={3}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span>
                          {rating.scope === "ip"
                            ? t("ip.scenarios.verifiedIpEgress")
                            : rating.scope === "different"
                              ? t("ip.scenarios.differentEgress")
                              : t("ip.scenarios.currentNetwork")}
                        </span>
                        <span>{status}</span>
                        {rating.stars !== null && (
                          <ScenarioStars stars={rating.stars} />
                        )}
                      </div>
                      {rating.scope === "different" && (
                        <p>
                          {t(
                            "ip.scenarios.egressDiffersQueriedIpStarsDescribeAccessCurrent",
                          )}
                        </p>
                      )}
                      {evidence && <EvidenceDetails evidence={evidence} />}
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
