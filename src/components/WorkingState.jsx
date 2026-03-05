import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WorkingState = ({ gitState }) => {
  const { files, stageFile, unstageFile } = gitState;

  const getStatusColor = (status) => {
    switch (status) {
      case 'untracked': return 'var(--color-untracked)';
      case 'modified': return 'var(--color-modified)';
      case 'staged': return 'var(--color-staged)';
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusGlow = (status) => {
    switch (status) {
      case 'untracked': return 'glow-text-amber';
      case 'modified': return 'glow-text-magenta';
      case 'staged': return 'glow-text-cyan';
      default: return '';
    }
  };

  const workingFiles = files.filter(f => f.status !== 'staged');
  const stagedFiles = files.filter(f => f.status === 'staged');

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '24px' }}>
      <section>
        <h2 style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Working Directory</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence>
            {workingFiles.map(file => (
              <motion.div
                key={file.name}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => stageFile(file.name)}
                className={getStatusGlow(file.status)}
                style={{ 
                  color: getStatusColor(file.status),
                  cursor: 'pointer',
                  fontSize: '14px',
                  userSelect: 'none'
                }}
              >
                {file.name}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Staging Area</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence>
            {stagedFiles.map(file => (
              <motion.div
                key={file.name}
                layout
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => unstageFile(file.name)}
                className="glow-text-cyan"
                style={{ 
                  color: 'var(--color-staged)',
                  border: '1px solid var(--border-glass)',
                  padding: '4px 8px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  userSelect: 'none',
                  display: 'inline-block',
                  width: 'fit-content'
                }}
              >
                {file.name}
              </motion.div>
            ))}
          </AnimatePresence>
          {stagedFiles.length === 0 && (
            <div style={{ color: 'var(--border-glass)', fontSize: '13px', fontStyle: 'italic' }}>Empty</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default WorkingState;
