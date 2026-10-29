import { endpoint } from "@/lib/network";
import type { Map as LeafletMap, TileLayer, TileLayerOptions } from "leaflet";

export type MapProvider = "osm" | "tianditu";

export interface MapConfig {
  provider: MapProvider;
  token?: string;
}

export interface MapTileLayerSpec {
  url: string;
  options: TileLayerOptions;
}

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const TIANDITU_ATTRIBUTION =
  '&copy; <a href="https://www.tianditu.gov.cn/">天地图</a>';
const TIANDITU_SUBDOMAINS = ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"];

let mapConfigPromise: Promise<MapConfig> | undefined;

export function normalizeMapConfig(value: unknown): MapConfig {
  if (!value || typeof value !== "object") return { provider: "osm" };
  const config = value as { provider?: unknown; token?: unknown };
  const token = typeof config.token === "string" ? config.token.trim() : "";
  return config.provider === "tianditu" && token
    ? { provider: "tianditu", token }
    : { provider: "osm" };
}

export function loadMapConfig() {
  return (mapConfigPromise ??= endpoint<unknown>("/map/config", {
    signal: AbortSignal.timeout(3000),
  })
    .then(normalizeMapConfig)
    .catch(() => {
      mapConfigPromise = undefined;
      return { provider: "osm" as const };
    }));
}

export function mapTileLayers(config: MapConfig): MapTileLayerSpec[] {
  const options: TileLayerOptions = {
    maxZoom: 19,
    updateWhenIdle: true,
    updateWhenZooming: false,
    keepBuffer: 1,
    // Tile providers need the site origin, never the queried IP in the page URL.
    referrerPolicy: "strict-origin",
  };
  if (config.provider === "tianditu" && config.token) {
    const token = encodeURIComponent(config.token);
    const url = (type: "vec_w" | "cva_w") =>
      `https://{s}.tianditu.gov.cn/DataServer?T=${type}&x={x}&y={y}&l={z}&tk=${token}`;
    return [
      {
        url: url("vec_w"),
        options: {
          ...options,
          subdomains: TIANDITU_SUBDOMAINS,
          attribution: TIANDITU_ATTRIBUTION,
        },
      },
      {
        url: url("cva_w"),
        options: { ...options, subdomains: TIANDITU_SUBDOMAINS },
      },
    ];
  }
  return [
    {
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      options: { ...options, attribution: OSM_ATTRIBUTION },
    },
  ];
}

type TileLayerFactory = typeof import("leaflet").tileLayer;

interface MapLayerSet {
  layers: TileLayer[];
}

export function attachMapLayers(
  tileLayer: TileLayerFactory,
  map: LeafletMap,
  config: MapConfig,
  onTileLoad: () => void,
  onTileError: () => void,
) {
  let disposed = false;
  let generation = 0;
  let current: MapLayerSet | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const removeCurrent = () => {
    clearTimeout(timeout);
    const layers = current?.layers ?? [];
    current = undefined;
    for (const layer of layers) {
      layer.off();
      layer.remove();
    }
  };

  const activate = (nextConfig: MapConfig) => {
    if (disposed) return;
    const currentGeneration = ++generation;
    const layers = mapTileLayers(nextConfig).map(({ url, options }) =>
      tileLayer(url, options),
    );
    const loadedLayers = new Set<TileLayer>();
    let reportedError = false;
    const fail = () => {
      if (disposed || currentGeneration !== generation) return;
      if (nextConfig.provider === "tianditu") {
        removeCurrent();
        activate({ provider: "osm" });
      } else if (loadedLayers.size < layers.length && !reportedError) {
        clearTimeout(timeout);
        reportedError = true;
        onTileError();
      }
    };
    current = { layers };
    timeout = setTimeout(fail, 10_000);
    for (const layer of layers) {
      layer.on("loading", () => {
        if (disposed || currentGeneration !== generation) return;
        loadedLayers.delete(layer);
        reportedError = false;
        clearTimeout(timeout);
        timeout = setTimeout(fail, 10_000);
      });
      layer.on("tileload", () => {
        if (disposed || currentGeneration !== generation) return;
        loadedLayers.add(layer);
        // Tianditu needs both the basemap and its place-name annotation layer.
        if (loadedLayers.size === layers.length) {
          clearTimeout(timeout);
          onTileLoad();
        }
      });
      layer.on("tileerror", fail);
      if (disposed || currentGeneration !== generation) break;
      layer.addTo(map);
    }
  };

  activate(config);
  return () => {
    disposed = true;
    generation++;
    removeCurrent();
  };
}

function isChinaCoordinate(latitude: number, longitude: number) {
  return (
    latitude >= 3.8 &&
    latitude <= 53.6 &&
    longitude >= 73.5 &&
    longitude <= 135.1
  );
}

export function mapExternalUrl(
  latitude: number,
  longitude: number,
  label?: string,
) {
  if (isChinaCoordinate(latitude, longitude)) {
    const params = new URLSearchParams({
      position: `${longitude},${latitude}`,
      coordinate: "wgs84",
      src: "one-ip",
    });
    if (label) params.set("name", label);
    return `https://uri.amap.com/marker?${params}`;
  }
  return `https://www.openstreetmap.org/?mlat=${encodeURIComponent(latitude)}&mlon=${encodeURIComponent(longitude)}#map=7/${encodeURIComponent(latitude)}/${encodeURIComponent(longitude)}`;
}
