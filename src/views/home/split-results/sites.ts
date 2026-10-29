import { localizeCatalogItem } from "@/lib/localize-catalog";
import rawsites from "../sites.json";

export const sites = rawsites.map(localizeCatalogItem);
