import { useState } from "react";
import { t } from "@/i18n";
import { countryCode } from "@/lib/country";
import { Globe2 } from "lucide-react";

const sizes = {
  sm: { className: "", width: 40 },
  lg: { className: " country-flag-lg", width: 80 },
  xl: { className: " country-flag-xl", width: 160 },
} as const;

/** Lazily loaded flag with a shimmer placeholder and a globe fallback. */
export function CountryFlag({
  code,
  size = "sm",
}: {
  code?: string;
  size?: keyof typeof sizes;
}) {
  const country = countryCode(code);
  const { className, width } = sizes[size];
  const src = country
    ? `https://flagcdn.com/w${width}/${country}.png`
    : undefined;
  const [status, setStatus] = useState<{
    src?: string;
    state: "loaded" | "error";
  }>({ state: "loaded" });
  const state = !src
    ? "fallback"
    : status.src !== src
      ? "loading"
      : status.state === "error"
        ? "fallback"
        : "loaded";
  return (
    <span
      role="img"
      aria-label={country?.toUpperCase() ?? t("common.unknownRegion")}
      className={`country-flag${className}`}
      data-state={state}
    >
      {state === "fallback" ? (
        <Globe2 aria-hidden="true" />
      ) : (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setStatus({ src, state: "loaded" })}
          onError={() => setStatus({ src, state: "error" })}
        />
      )}
    </span>
  );
}
