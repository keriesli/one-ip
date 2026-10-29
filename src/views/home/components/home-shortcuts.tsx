import { Link } from "react-router-dom";
import { SiteLogo } from "@/components/site-logo";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/i18n";
import {
  Activity,
  Fingerprint,
  Network,
  Search,
  ShieldCheck,
} from "lucide-react";
import { ToolDirectory } from "./tool-directory";

export function HomeShortcuts() {
  const tools = [
    {
      path: "/ai/claude",
      label: t("common.claudeChinaUserCheck"),
      description: t("home.inspectLanguageTimezoneDeviceSignalsExposedBrowser"),
      icon: () => <SiteLogo website="https://claude.ai" />,
    },
    {
      path: "/ai/gpt",
      label: t("home.chatgptDiagnostics"),
      description: t("home.checkAiServiceResponsesAndNetworkExits"),
      icon: () => <SiteLogo website="https://chatgpt.com" />,
    },
    {
      path: "/network/connectivity",
      label: t("common.connectivityEgress"),
      description: t(
        "home.checkWebsiteConnectivityResponseLatencyAndActualEgress",
      ),
      icon: Network,
    },
    {
      path: "/browser/challenges",
      label: t("home.humanVerification"),
      description: t("home.tryVerificationChallengesAndReviewResults"),
      icon: ShieldCheck,
    },
    {
      path: "/browser/consistency",
      label: t("common.consistency"),
      description: t("home.checkBrowserEnvironmentAndDeviceSignals"),
      icon: Search,
    },
    {
      path: "/browser/fingerprint",
      label: t("common.browserFingerprint"),
      description: t("home.exploreFingerprintComponentsAndChanges"),
      icon: Fingerprint,
    },
    {
      path: "/ai/status",
      label: t("navigation.serviceStatus"),
      description: t("home.viewPlatformIncidentsAndServiceUpdates"),
      icon: Activity,
    },
  ];
  return (
    <Card className="home-shortcuts">
      <CardContent>
        <nav aria-label={t("home.popularTools")} className="shortcut-tiles">
          {tools.map((tool) => (
            <Link key={tool.path} to={tool.path} title={tool.description}>
              <span className="shortcut-icon">
                <tool.icon aria-hidden="true" />
              </span>
              <span className="shortcut-name">{tool.label}</span>
            </Link>
          ))}
        </nav>
        <ToolDirectory />
      </CardContent>
    </Card>
  );
}
