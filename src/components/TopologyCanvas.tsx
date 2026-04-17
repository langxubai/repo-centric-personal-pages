import { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeMouseHandler,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GraphNode {
  id: string;
  title: string;
  type: 'math' | 'code' | 'logic' | 'bugfix';
  status: 'draft' | 'in-progress' | 'verified' | 'failed';
  description?: string;
  slug: string;
}

export interface GraphEdge {
  source: string;
  target: string;
}

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick: (node: GraphNode) => void;
}

// ─── Color Maps ───────────────────────────────────────────────────────────────
const typeColors: Record<string, string> = {
  math: '#a78bfa',
  code: '#6d8df7',
  logic: '#34d399',
  bugfix: '#fb923c',
};

const statusStyles: Record<string, React.CSSProperties> = {
  verified: { borderStyle: 'solid' },
  'in-progress': { borderStyle: 'dashed' },
  draft: { borderStyle: 'dotted', opacity: 0.7 },
  failed: { borderStyle: 'solid', borderColor: '#f87171' },
};

const typeIcons: Record<string, string> = {
  math: '∑',
  code: '</>',
  logic: '⬡',
  bugfix: '🐛',
};

// ─── Custom Node Component ─────────────────────────────────────────────────────
function CustomNode({ data }: { data: GraphNode & { onClick: () => void } }) {
  const color = typeColors[data.type] ?? '#6d8df7';
  const borderStyle = statusStyles[data.status] ?? statusStyles.verified;

  return (
    <div
      onClick={data.onClick}
      style={{
        background: 'rgba(18, 18, 30, 0.95)',
        border: `2px solid ${color}`,
        borderRadius: '10px',
        padding: '12px 16px',
        minWidth: '150px',
        maxWidth: '200px',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        boxShadow: `0 0 14px ${color}33, 0 4px 16px rgba(0,0,0,0.5)`,
        transition: 'all 200ms ease',
        ...borderStyle,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 24px ${color}66, 0 8px 24px rgba(0,0,0,0.6)`;
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.03)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 14px ${color}33, 0 4px 16px rgba(0,0,0,0.5)`;
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
      }}
      role="button"
      aria-label={`Open node: ${data.title}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && data.onClick()}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.75rem', color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          {typeIcons[data.type]}
        </span>
        <span style={{
          fontSize: '0.65rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color,
          fontWeight: 600,
          fontFamily: 'var(--font-sans)',
        }}>
          {data.type}
        </span>
        <span style={{
          marginLeft: 'auto',
          width: '6px', height: '6px',
          borderRadius: '50%',
          background: data.status === 'verified' ? '#34d399'
            : data.status === 'failed' ? '#f87171'
            : data.status === 'in-progress' ? '#fbbf24'
            : '#6b7280',
        }} />
      </div>
      <div style={{
        fontSize: '0.82rem',
        fontWeight: 600,
        color: '#e8e8f0',
        lineHeight: 1.3,
        fontFamily: 'var(--font-sans)',
      }}>
        {data.title}
      </div>
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

// ─── Layout: Layered auto-positioning ─────────────────────────────────────────
function computeLayout(gNodes: GraphNode[], gEdges: GraphEdge[]): { nodes: Node[]; edges: Edge[] } {
  // Build parent→children map
  const childrenOf: Record<string, string[]> = {};
  const hasParent = new Set<string>();

  gEdges.forEach(({ source, target }) => {
    if (!childrenOf[source]) childrenOf[source] = [];
    childrenOf[source].push(target);
    hasParent.add(target);
  });

  // BFS layering
  const layers: string[][] = [];
  const visited = new Set<string>();
  let current = gNodes.filter((n) => !hasParent.has(n.id)).map((n) => n.id);

  while (current.length > 0) {
    layers.push(current);
    current.forEach((id) => visited.add(id));
    const next: string[] = [];
    current.forEach((id) => {
      (childrenOf[id] ?? []).forEach((child) => {
        if (!visited.has(child)) next.push(child);
      });
    });
    current = [...new Set(next)];
  }

  // Place unvisited nodes
  gNodes.forEach((n) => {
    if (!visited.has(n.id)) layers[layers.length - 1]?.push(n.id) ?? layers.push([n.id]);
  });

  const nodeMap = new Map(gNodes.map((n) => [n.id, n]));
  const X_GAP = 240, Y_GAP = 140;

  const rfNodes: Node[] = layers.flatMap((layer, yi) =>
    layer.map((id, xi) => {
      const gn = nodeMap.get(id)!;
      return {
        id,
        type: 'custom',
        position: {
          x: (xi - (layer.length - 1) / 2) * X_GAP,
          y: yi * Y_GAP,
        },
        data: { ...gn },
      };
    })
  );

  const rfEdges: Edge[] = gEdges.map(({ source, target }, i) => ({
    id: `e-${i}`,
    source,
    target,
    animated: false,
    style: { stroke: 'rgba(109,141,247,0.4)', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(109,141,247,0.6)', width: 14, height: 14 },
  }));

  return { nodes: rfNodes, edges: rfEdges };
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function TopologyCanvas({ nodes: gNodes, edges: gEdges, onNodeClick }: Props) {
  const { nodes: initialNodes, edges: initialEdges } = computeLayout(gNodes, gEdges);

  const nodesWithClick = initialNodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      onClick: () => {
        const gn = gNodes.find((g) => g.id === n.id);
        if (gn) {
          onNodeClick(gn);
          // Dispatch custom event so Astro page script can handle modal
          window.dispatchEvent(new CustomEvent('topology:node-click', { detail: gn }));
        }
      },
    },
  }));

  const [nodes, , onNodesChange] = useNodesState(nodesWithClick);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          size={1.5}
          gap={24}
          color="rgba(109,141,247,0.1)"
        />
        <Controls
          style={{
            background: 'rgba(18,18,30,0.9)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
          }}
        />
        <MiniMap
          nodeColor={(n) => typeColors[(n.data as GraphNode).type] ?? '#6d8df7'}
          style={{
            background: 'rgba(13,13,26,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
          }}
          maskColor="rgba(7,7,15,0.7)"
        />
      </ReactFlow>
    </div>
  );
}
