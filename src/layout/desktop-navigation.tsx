import { NavLink } from "react-router-dom";
import { navigationRoutes } from "./routes";

/** Flat section links; tools inside a section are tabs on the page itself. */
export function DesktopNavigation({ activeRoute }: { activeRoute: string }) {
  return (
    <ul className="desktop-navigation">
      {navigationRoutes.map((route) => (
        <li key={route.value}>
          <NavLink
            to={route.value.replace(/\/$/, "") || "/"}
            className="desktop-navigation-trigger"
            aria-current={route.value === activeRoute ? "page" : undefined}
          >
            {route.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
