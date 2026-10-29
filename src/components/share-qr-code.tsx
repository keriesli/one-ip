import { t } from "@/i18n";
import { QRCodeSVG } from "qrcode.react";

export default function ShareQrCode({ value }: { value: string }) {
  return (
    <QRCodeSVG
      value={value}
      size={224}
      level="M"
      marginSize={4}
      bgColor="#ffffff"
      fgColor="#111827"
      title={t("share.scanToOpenThisPage")}
      className="block h-auto w-full rounded-xl"
    />
  );
}
