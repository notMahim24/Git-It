import React from 'react';
import { useGitState } from '../hooks/useGitState';
import WorkingState from './WorkingState';
import HistoryGraph from './HistoryGraph';
import Terminal from './Terminal';

const Layout = () => {
  const gitState = useGitState();

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateRows: '1fr 200px', 
      height: '100vh', 
      padding: '24px',
      gap: '24px'
    }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(300px, 1fr) 2fr', 
        gap: '24px'
      }}>
        {!gitState.isInitialized ? (
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
