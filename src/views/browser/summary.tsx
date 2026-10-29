import { Link } from "react-router-dom";
import { Pending } from "@/components/toolkit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnderlineHover } from "@/components/underline-hover";
import { t } from "@/i18n";
import { useQuery } from "@tanstack/react-query";
import { Clock, Fingerprint, Languages, Monitor } from "lucide-react";
import { fingerprint } from "./collect";

export function BrowserSummary() {
  const query = useQuery({
    queryKey: ["home-browser-fingerprint"],
    queryFn: () => fingerprint(),
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });
  return (
    <Card className="mb-3">
      <CardHeader>
        <div className="row-between">
          <CardTitle>{t("common.browserEnvironment")}</CardTitle>
          <UnderlineHover asChild>
            <Link className="small muted" to="/browser/environment">
              {t("browser.viewFullCheck")}
            </Link>
          </UnderlineHover>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="browser-summary-stats">
          {[
            {
              icon: Monitor,
              label: t("browser.platform"),
              value: navigator.platform || "—",
              title: navigator.userAgent,
            },
            {
              icon: Languages,
              label: t("browser.language"),
              value: navigator.language,
            },
            {
              icon: Clock,
              label: t("common.timezone"),
              value: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          ].map((item) => (
            <div key={item.label} title={item.title}>
              <dt>
                <item.icon aria-hidden="true" />
                {item.label}
              </dt>
              <dd>{item.value}</dd>
            </div>
          ))}
          <div>
            <dt>
              <Fingerprint aria-hidden="true" />
              {t("browser.browserFingerprintVisitorId")}
            </dt>
            <dd>
              {query.isPending ? (
                <Pending>{t("common.checking")}</Pending>
              ) : query.data ? (
                <Link
                  className="font-mono"
                  to="/browser/fingerprint"
                  title={query.data.visitorId}
                >
                  {query.data.visitorId.slice(0, 12)}…
                </Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
