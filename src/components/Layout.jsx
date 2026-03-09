import React from 'react';
import { useGitState } from '../hooks/useGitState';
import WorkingState from './WorkingState';
import HistoryGraph from './HistoryGraph';
import Terminal from './Terminal';

import { ArrowLeft, CheckCircle, Info } from 'lucide-react';

const Layout = ({ mode = 'free', onBack }) => {
  const gitState = useGitState(mode);

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateRows: mode === 'game' ? 'auto 1fr 200px' : '1fr 200px', 
      height: '100vh', 
      padding: '24px',
      gap: '24px'
    }}>
      {/* HUD / Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            padding: '8px 12px',
            borderRadius: '4px',
            transition: 'var(--transition-smooth)'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={(e) => e.target.style.background = 'none'}
        >
          <ArrowLeft size={16} />
          Back to Menu
        </button>

        {mode === 'game' && gitState.currentLevel && (
          <div className="glass-panel" style={{ 
            padding: '12px 24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px',
            border: gitState.isLevelComplete ? '1px solid var(--color-modified)' : '1px solid var(--border-glass)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Level {gitState.currentLevel.id}: {gitState.currentLevel.title}
              </span>
              <span style={{ fontSize: '14px', color: gitState.isLevelComplete ? 'var(--color-modified)' : 'var(--text-primary)' }}>
                {gitState.currentLevel.objective}
              </span>
            </div>
            {gitState.isLevelComplete ? (
              <CheckCircle size={24} color="var(--color-modified)" />
            ) : (
              <Info size={24} color="var(--color-active)" />
            )}
          </div>
        )}

        <div style={{ width: '120px' }} /> {/* Spacer */}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(300px, 1fr) 2fr', 
        gap: '24px'
      }}>
        {!gitState.isInitialized && mode === 'free' ? (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>Repository Not Initialized</h2>
            <p>Type <code>git init</code> in the terminal below to start your Git It session.</p>
          </div>
        ) : (
          <>
            <WorkingState gitState={gitState} />
            <HistoryGraph gitState={gitState} />
          </>
        )}
      </div>
      <Terminal gitState={gitState} />
    </div>
  );
};

export default Layout;
