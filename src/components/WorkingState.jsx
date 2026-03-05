import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WorkingState = ({ gitState }) => {
  const { files, stageFile, unstageFile } = gitState;

  const getStatusColor = (status) => {
    switch (status) {
      case 'untracked': return 'var(--color-untracked)'; // Amber
      case 'modified': return 'var(--color-modified)';   // Magenta
      case 'tracked': return 'var(--text-secondary)';    // Gray (Unmodified)
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusGlow = (status) => {
    switch (status) {
      case 'untracked': return 'glow-text-amber';
      case 'modified': return 'glow-text-magenta';
      default: return '';
    }
  };

  const untrackedFiles = files.filter(f => f.status === 'untracked');
  const trackedFiles = files.filter(f => f.status === 'tracked' || f.status === 'modified');
  const stagedFiles = files.filter(f => f.staged);

  const FileItem = ({ file, isStagedSection = false }) => (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => isStagedSection ? unstageFile(file.name) : stageFile(file.name)}
      className={isStagedSection ? "glow-text-cyan" : getStatusGlow(file.status)}
      style={{ 
        color: isStagedSection ? 'var(--color-staged)' : getStatusColor(file.status),
        cursor: 'pointer',
        fontSize: '14px',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: isStagedSection ? '4px 8px' : '0',
        border: isStagedSection ? '1px solid var(--border-glass)' : 'none',
        borderRadius: '2px',
        width: 'fit-content'
      }}
    >
      {file.name}
      {file.staged && !isStagedSection && (
        <span style={{ fontSize: '10px', color: 'var(--color-staged)', opacity: 0.8 }}>[staged]</span>
      )}
    </motion.div>
  );

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', overflowY: 'auto' }}>
      
      {/* Working Directory Section */}
      <section>
        <h2 style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Working Directory</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '8px' }}>
          
          {/* Tracked Files */}
          <div>
            <h3 style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '10px', opacity: 0.6 }}>TRACKED</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <AnimatePresence>
                {trackedFiles.map(file => <FileItem key={file.name} file={file} />)}
              </AnimatePresence>
              {trackedFiles.length === 0 && <div style={{ color: 'var(--border-glass)', fontSize: '12px' }}>None</div>}
            </div>
          </div>

          {/* Untracked Files */}
          <div>
            <h3 style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '10px', opacity: 0.6 }}>UNTRACKED</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <AnimatePresence>
                {untrackedFiles.map(file => <FileItem key={file.name} file={file} />)}
              </AnimatePresence>
              {untrackedFiles.length === 0 && <div style={{ color: 'var(--border-glass)', fontSize: '12px' }}>None</div>}
            </div>
          </div>

        </div>
      </section>

      {/* Staging Area Section */}
      <section style={{ marginTop: 'auto', borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
        <h2 style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Staging Area</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence>
            {stagedFiles.map(file => <FileItem key={file.name} file={file} isStagedSection={true} />)}
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
