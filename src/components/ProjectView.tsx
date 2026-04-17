import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { viewMode } from '../stores/viewMode';
import TopologyCanvas, { type GraphNode, type GraphEdge } from './TopologyCanvas';

interface NodeEntry {
  id: string;
  title: string;
  type: 'math' | 'code' | 'logic' | 'bugfix';
  status: 'draft' | 'in-progress' | 'verified' | 'failed';
  description?: string;
  slug: string;
  htmlContent: string;
}

interface CommitEntry {
  title: string;
  date: string;
  tags: string[];
  summary?: string;
  htmlContent: string;
}

interface Props {
  nodes: NodeEntry[];
  edges: GraphEdge[];
  commits: CommitEntry[];
  projectIndexHtml: string;
}

const typeColors: Record<string, string> = {
  math: '#a78bfa',
  code: '#6d8df7',
  logic: '#34d399',
  bugfix: '#fb923c',
};

const typeIcons: Record<string, string> = {
  math: '∑',
  code: '</>',
  logic: '⬡',
  bugfix: '🔧',
};

export default function ProjectView({ nodes, edges, commits, projectIndexHtml }: Props) {
  const mode = useStore(viewMode);
  const [selectedNode, setSelectedNode] = useState<NodeEntry | null>(null);

  const graphNodes: GraphNode[] = nodes.map((n) => ({
    id: n.id,
    title: n.title,
    type: n.type,
    status: n.status,
    description: n.description,
    slug: n.slug,
  }));

  function handleNodeClick(gn: GraphNode) {
    const full = nodes.find((n) => n.id === gn.id);
    if (full) setSelectedNode(full);
  }

  return (
    <>
      {/* ── BLUEPRINT VIEW ── */}
      {mode === 'blueprint' && (
        <div className="blueprint-layout">
          {/* Left: project overview */}
          <aside className="overview-panel glass">
            <div className="overview-scroll">
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: projectIndexHtml }}
              />
            </div>
          </aside>

          {/* Right: Topology Graph */}
          <div className="canvas-panel">
            <div className="canvas-wrap glass">
              <TopologyCanvas
                nodes={graphNodes}
                edges={edges}
                onNodeClick={handleNodeClick}
              />
            </div>
            {nodes.length === 0 && (
              <div className="empty-canvas">
                <span style={{ fontSize: '2rem' }}>⬡</span>
                <p>No nodes yet. Add MDX files to <code>nodes/</code></p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── JOURNEY VIEW ── */}
      {mode === 'journey' && (
        <div className="journey-layout">
          {commits.length === 0 ? (
            <div className="empty-canvas">
              <span style={{ fontSize: '2rem' }}>📝</span>
              <p>No commits yet. Add MDX files to <code>commits/</code></p>
            </div>
          ) : (
            <div className="timeline">
              {commits.map((commit, i) => (
                <article key={i} className="commit-entry glass">
                  <div className="commit-spine">
                    <div className="commit-dot" />
                    {i < commits.length - 1 && <div className="commit-line" />}
                  </div>
                  <div className="commit-body">
                    <div className="commit-meta">
                      <time
                        className="commit-time"
                        dateTime={commit.date}
                      >
                        {new Date(commit.date).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                      <div className="commit-tags">
                        {commit.tags.map((tag, j) => (
                          <span key={j} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <h2 className="commit-title">{commit.title}</h2>
                    {commit.summary && (
                      <p className="commit-summary">{commit.summary}</p>
                    )}
                    <div
                      className="prose commit-content"
                      dangerouslySetInnerHTML={{ __html: commit.htmlContent }}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── NODE DETAIL MODAL ── */}
      {selectedNode && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setSelectedNode(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Node detail: ${selectedNode.title}`}
        >
          <div className="modal-panel glass">
            <div className="modal-header">
              <div className="modal-type-badge" style={{ color: typeColors[selectedNode.type], borderColor: typeColors[selectedNode.type] + '55', background: typeColors[selectedNode.type] + '18' }}>
                <span>{typeIcons[selectedNode.type]}</span>
                <span>{selectedNode.type}</span>
              </div>
              <button
                className="modal-close"
                onClick={() => setSelectedNode(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <h2 className="modal-title">{selectedNode.title}</h2>
            <div className="modal-body">
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: selectedNode.htmlContent }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ── Layout ── */
        .blueprint-layout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 20px;
          height: calc(100vh - var(--nav-height) - 180px);
          min-height: 500px;
        }
        .overview-panel {
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .overview-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
          scrollbar-width: thin;
        }
        .canvas-panel { position: relative; }
        .canvas-wrap {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          background: rgba(7,7,15,0.6);
        }
        .empty-canvas {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        /* ── Timeline ── */
        .journey-layout { max-width: 780px; margin: 0 auto; }
        .timeline { display: flex; flex-direction: column; gap: 0; }

        .commit-entry {
          display: grid;
          grid-template-columns: 40px 1fr;
          gap: 20px;
          border-radius: 12px;
          margin-bottom: 16px;
          overflow: hidden;
          padding: 28px 28px 28px 0;
          transition: border-color 250ms ease;
        }
        .commit-entry:hover { border-color: var(--border-accent); }

        .commit-spine {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 4px;
        }
        .commit-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: var(--accent-primary);
          box-shadow: 0 0 8px var(--accent-glow);
          flex-shrink: 0;
          margin-left: 20px;
        }
        .commit-line {
          flex: 1;
          width: 1px;
          background: linear-gradient(to bottom, var(--border-accent), transparent);
          margin-top: 6px;
        }

        .commit-body { padding-right: 8px; }
        .commit-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .commit-time {
          font-size: 0.8rem;
          font-family: var(--font-mono);
          color: var(--text-muted);
        }
        .commit-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .commit-title {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
          line-height: 1.35;
        }
        .commit-summary {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-bottom: 16px;
          font-style: italic;
        }
        .commit-content { max-width: none; }

        /* ── Modal ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(7,7,15,0.75);
          backdrop-filter: blur(6px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: fadeIn 200ms ease;
        }
        .modal-panel {
          width: 100%;
          max-width: 760px;
          max-height: 85vh;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: fadeInUp 250ms ease;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 0;
        }
        .modal-type-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .modal-close {
          width: 28px; height: 28px;
          border-radius: 6px;
          border: 1px solid var(--border-normal);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 150ms ease;
        }
        .modal-close:hover {
          color: var(--text-primary);
          border-color: var(--border-accent);
          background: var(--bg-elevated);
        }
        .modal-title {
          font-size: 1.4rem;
          color: var(--text-primary);
          padding: 12px 24px 0;
          line-height: 1.3;
        }
        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px 24px;
          scrollbar-width: thin;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .blueprint-layout {
            grid-template-columns: 1fr;
            grid-template-rows: auto minmax(400px, 60vh);
            height: auto;
          }
          .overview-panel { max-height: 360px; }
        }
      `}</style>
    </>
  );
}
