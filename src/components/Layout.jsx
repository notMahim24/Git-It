import React from 'react';
import { useGitState } from '../hooks/useGitState';
import WorkingState from './WorkingState';
import GitHistory from './GitHistory';
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
        <WorkingState gitState={gitState} />
        <GitHistory gitState={gitState} />
      </div>
      <Terminal gitState={gitState} />
    </div>
  );
};

export default Layout;
