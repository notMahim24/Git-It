import React, { useState, useRef, useEffect } from 'react';

const Terminal = ({ gitState }) => {
  const { terminalOutput, executeCommand } = gitState;
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        executeCommand(input);
        setHistory(prev => [input, ...prev].slice(0, 50));
      }
      setInput('');
      setHistoryIdx(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIdx = historyIdx + 1;
      if (nextIdx < history.length) {
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = historyIdx - 1;
      if (nextIdx >= 0) {
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx]);
      } else {
        setHistoryIdx(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="glass-panel" 
      ref={scrollRef}
      style={{ 
        padding: '24px', 
        border: '1px solid var(--color-committed)', 
        background: '#000',
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        color: 'var(--color-committed)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
      <div style={{ opacity: 0.8 }}>
        {terminalOutput.map((out, i) => (
          <div key={i} style={{ marginBottom: out.type === 'input' ? '4px' : '12px' }}>
            {out.type === 'input' ? (
              <span style={{ color: 'var(--color-committed)' }}>~/project $ {out.text}</span>
            ) : (
              <pre style={{ 
                fontFamily: 'inherit', 
                whiteSpace: 'pre-wrap', 
                color: 'var(--text-secondary)',
                margin: 0
              }}>{out.text}</pre>
            )}
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--color-committed)', flexShrink: 0 }}>~/project $</span>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--color-committed)',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            flex: 1,
            caretColor: 'var(--color-committed)'
          }}
        />
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-glass); border-radius: 2px; }
      `}</style>
    </div>
  );
};

export default Terminal;
