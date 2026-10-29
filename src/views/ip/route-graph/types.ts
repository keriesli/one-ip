export interface RouteItem {
  asn: string;
  name?: string;
  count: number;
  share: number;
  tier1?: boolean;
  via?: string[];
}

interface RouteEdge {
  origin: string;
  direct: string;
  count: number;
  share: number;
}

interface SecondaryEdge {
  direct: string;
  secondary: string;
  count: number;
  share: number;
}

export interface RouteTopology {
  observedPaths: number;
  queryTime?: string | number;
  origins: RouteItem[];
  direct: RouteItem[];
  secondary: RouteItem[];
  edges: RouteEdge[];
  secondaryEdges: SecondaryEdge[];
}

export interface IpNetwork {
  prefix?: string;
  asns?: string[];
  ptr?: string;
  routeAvailable: boolean;
  validations?: {
    asn: string;
    status: string;
  }[];
  source?: string;
  topology?: RouteTopology;
}
