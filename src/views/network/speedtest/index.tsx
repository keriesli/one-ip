import { PageHeading } from "@/components/toolkit";
import { t } from "@/i18n";
import { CloudflareTest } from "./components/cloudflare-test";

export default function SpeedtestPage() {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <PageHeading title={t("speedtest.title")} />
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{t("speedtest.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("speedtest.description")}
        </p>
      </div>
      <CloudflareTest />
    </div>
  );
}
