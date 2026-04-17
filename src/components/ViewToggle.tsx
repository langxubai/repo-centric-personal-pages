import { useStore } from '@nanostores/react';
import { viewMode } from '../stores/viewMode';

export default function ViewToggle() {
  const mode = useStore(viewMode);

  return (
    <div className="view-toggle" role="group" aria-label="View mode toggle">
      <button
        id="toggle-blueprint"
        className={`toggle-btn ${mode === 'blueprint' ? 'active' : ''}`}
        onClick={() => viewMode.set('blueprint')}
        aria-pressed={mode === 'blueprint'}
        title="Blueprint View — Interactive topology graph"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
          <path d="M12 7v4M9.5 17.5 12 11l2.5 6.5"/>
        </svg>
        Blueprint
      </button>
      <button
        id="toggle-journey"
        className={`toggle-btn ${mode === 'journey' ? 'active' : ''}`}
        onClick={() => viewMode.set('journey')}
        aria-pressed={mode === 'journey'}
        title="Journey View — Commit timeline"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6"/><circle cx="8" cy="6" r="2" fill="currentColor"/>
          <line x1="3" y1="12" x2="21" y2="12"/><circle cx="16" cy="12" r="2" fill="currentColor"/>
          <line x1="3" y1="18" x2="21" y2="18"/><circle cx="10" cy="18" r="2" fill="currentColor"/>
        </svg>
        Journey
      </button>

      <style>{`
        .view-toggle {
          display: inline-flex;
          gap: 2px;
          background: var(--bg-deep);
          border: 1px solid var(--border-normal);
          border-radius: var(--radius-md);
          padding: 3px;
        }
        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 7px;
          border: none;
          font-size: 0.85rem;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 200ms ease;
          color: var(--text-muted);
          background: transparent;
        }
        .toggle-btn:hover:not(.active) {
          color: var(--text-secondary);
          background: var(--bg-elevated);
        }
        .toggle-btn.active {
          color: var(--text-primary);
          background: var(--bg-elevated);
          box-shadow: 0 0 10px var(--accent-glow);
          border: 1px solid var(--border-accent);
        }
      `}</style>
    </div>
  );
}
