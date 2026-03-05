import React from 'react';

const Terminal = ({ gitState }) => {
  return (
    <div className="glass-panel" style={{ 
      padding: '24px', 
      border: '1px solid var(--color-committed)', 
      background: '#000',
      fontFamily: 'var(--font-mono)',
      fontSize: '14px',
      color: 'var(--color-committed)',
      overflowY: 'auto'
    }}>
      <div style={{ opacity: 0.8 }}>
        <p>~/project $ git add .</p>
        <p>~/project $ git commit -m "update"</p>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>[main 7a2b5c] update</p>
        <p style={{ color: 'var(--text-secondary)' }}> 3 files changed, 45 insertions(+)</p>
        <p>~/project $ <span style={{ animation: 'blink 1s step-end infinite' }}>_</span></p>
      </div>

      <style>{`
        @keyframes blink {
          from, to { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Terminal;
