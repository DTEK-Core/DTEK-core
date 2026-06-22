export interface GraphNode {
  id: string;
  name: string;
  type: string;
  trust_score: number;
  criticality: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
  size: number;
}

export interface GraphLink {
  id: string;
  source: GraphNode;
  target: GraphNode;
  relation_type: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Input shape from Supabase (source/target are node IDs, not references)
export interface RawLink {
  id: string;
  source: string;
  target: string;
  relation_type: string;
}
