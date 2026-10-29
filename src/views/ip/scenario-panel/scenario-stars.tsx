import { t } from "@/i18n";
import { Star } from "lucide-react";

export function ScenarioStars({
  stars,
  showValue = true,
}: {
  stars: number;
  showValue?: boolean;
}) {
  return (
    <span
      className="ip-scenario-stars"
      data-rating={Math.floor(stars)}
      aria-label={t("ip.scenarios.rating5", [stars])}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className="ip-scenario-star" aria-hidden="true">
          <Star size={12} />
          <span
            className="ip-scenario-star-fill"
            style={{
              width: `${Math.min(1, Math.max(0, stars - index)) * 100}%`,
            }}
          >
            <Star size={12} className="is-filled" />
          </span>
        </span>
      ))}
      {showValue && <span>{stars}/5</span>}
    </span>
  );
}
