import { t } from "@/i18n";
import { type EvidenceState } from "../scenario-evidence";

export const stateLabels: Record<EvidenceState, string> = {
  unmeasured: t("common.notChecked"),
  running: t("common.checking"),
  complete: t("ip.scenarios.evidenceCollected"),
  partial: t("ip.scenarios.incompleteEvidence"),
  failed: t("ip.scenarios.requestRefused"),
  "rate-limited": t("ip.scenarios.rateLimited"),
  unverifiable: t("ip.scenarios.unverifiable"),
  mismatch: t("ip.scenarios.egressMismatch"),
  expired: t("ip.scenarios.expired"),
  cancelled: t("common.cancelled"),
};
export const stateTone = (state: EvidenceState) =>
  ["unmeasured", "cancelled", "unverifiable"].includes(state)
    ? "secondary"
    : state === "complete"
      ? "success"
      : state === "failed"
        ? "danger"
        : ["partial", "mismatch", "expired", "rate-limited"].includes(state)
          ? "warning"
          : "info";
export const metricLabels: Record<string, string> = {
  latency: t("ip.scenarios.unloadedLatency"),
  jitter: t("ip.scenarios.jitter"),
  download: t("ip.scenarios.download"),
  upload: t("ip.scenarios.upload"),
  downLoadedLatency: t("ip.scenarios.downloadLoadedLatency"),
  upLoadedLatency: t("ip.scenarios.uploadLoadedLatency"),
  packetLoss: t("ip.scenarios.udpPacketLoss"),
  latencySamples: t("ip.scenarios.insufficientLatencySamples"),
  packetSamples: t("ip.scenarios.insufficientUdpSamples"),
  loadedSamples: t("ip.scenarios.insufficientLoadedSamples"),
  downloadSamples: t("ip.scenarios.insufficientDownloadSamples"),
  uploadSamples: t("ip.scenarios.insufficientUploadSamples"),
  aimScore: t("ip.scenarios.aimScoreUnavailable"),
};
