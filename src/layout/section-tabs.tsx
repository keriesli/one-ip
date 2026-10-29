import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { NavigationItem } from "./navigation-menus";
import { activeTool } from "./routes";

/** Tabs for the tools inside one section, shown on every screen size. */
export function SectionTabs({
  label,
  items,
}: {
  label: string;
  items: readonly NavigationItem[];
}) {
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const current = activeTool(pathname);

  useEffect(() => {
    const viewport = navRef.current?.querySelector<HTMLElement>(
      "[data-slot=scroll-area-viewport]",
    );
    const selected = navRef.current?.querySelector<HTMLElement>(
      '[aria-current="page"]',
    );
    if (!viewport || !selected) return;
    const parent = viewport.getBoundingClientRect();
    const child = selected.getBoundingClientRect();
    const offset =
      child.left < parent.left
        ? child.left - parent.left - 8
        : child.right > parent.right
          ? child.right - parent.right + 8
          : 0;
    if (offset) viewport.scrollBy({ left: offset, behavior: "instant" });
  }, [pathname, items]);

  return (
    <nav ref={navRef} className="section-tabs" aria-label={label}>
      <ScrollArea>
        <div className="section-tabs-links">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              aria-current={item.path === current ? "page" : undefined}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </nav>
  );
}
