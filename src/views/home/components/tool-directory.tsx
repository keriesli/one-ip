import { Link } from "react-router-dom";
import { UnderlineHover } from "@/components/underline-hover";
import { useAvailableTools } from "@/hooks/use-available-tools";
import { t } from "@/i18n";
import { toolGroups } from "@/layout/routes";
import {
  ChevronDown,
  Search,
  Fingerprint,
  Network,
  Sparkles,
} from "lucide-react";

/** Full tool index, collapsed by default so the home page stays focused. */
export function ToolDirectory() {
  const browserTools = useAvailableTools("browser");
  const navigationGroups = [
    { label: t("navigation.lookup"), icon: Search, tools: toolGroups.lookup },
    {
      label: t("navigation.network"),
      icon: Network,
      tools: toolGroups.network,
    },
    {
      label: t("navigation.browser"),
      icon: Fingerprint,
      tools: browserTools,
    },
    { label: "AI", icon: Sparkles, tools: toolGroups.ai },
  ];
  const count = navigationGroups.reduce(
    (total, group) => total + group.tools.length,
    0,
  );
  return (
    <details className="home-tool-directory">
      <summary>
        <span id="home-tool-directory-title">
          {t("home.allTools")} · {count}
        </span>
        <ChevronDown className="tool-directory-chevron" aria-hidden="true" />
      </summary>
      <nav
        aria-labelledby="home-tool-directory-title"
        className="tool-directory-groups"
      >
        {navigationGroups.map((group) => (
          <section className="tool-directory-group" key={group.label}>
            <h3 className="tool-directory-heading">
              <group.icon aria-hidden="true" />
              {group.label}
            </h3>
            <ul className="tool-directory-links">
              {group.tools.map((tool) => (
                <li key={tool.path}>
                  <Link to={tool.path}>{tool.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <UnderlineHover asChild>
          <Link className="small muted tool-directory-api" to="/docs/api">
            {t("common.apiDocumentation")} ›
          </Link>
        </UnderlineHover>
      </nav>
    </details>
  );
}
