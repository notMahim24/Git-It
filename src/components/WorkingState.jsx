import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WorkingState = ({ gitState }) => {
  const { files, stageFile, unstageFile } = gitState;

  const getStatusColor = (status) => {
    switch (status) {
      case 'untracked': return 'var(--color-untracked)'; // Red
      case 'modified': return 'var(--color-modified)';   // Green
      case 'tracked': return 'var(--color-unmodified)';  // Gray
      default: return 'var(--text-secondary)';
    }
  };

  const untrackedFiles = files.filter(f => f.status === 'untracked' && !f.deleted);
  const trackedFiles = files.filter(f => (f.status === 'tracked' || f.status === 'modified') && !f.deleted);
  const stagedFiles = files.filter(f => f.staged || f.stagedDeletion);

  const FileItem = ({ file, isStagedSection = false }) => {
    const isUnmodified = !isStagedSection && file.status === 'tracked' && !file.deleted && !file.stagedDeletion;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={() => {
          if (isUnmodified) return;
          isStagedSection ? unstageFile(file.name) : stageFile(file.name);
        }}
        title={isUnmodified ? 'File is unmodified' : (isStagedSection ? `Unstage ${file.name}` : `Stage ${file.name}`)}
        style={{ 
          color: isStagedSection ? 'var(--color-staged)' : getStatusColor(file.status),
          cursor: isUnmodified ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: isStagedSection ? '4px 8px' : '0',
          border: isStagedSection ? '1px solid var(--border-glass)' : 'none',
          borderRadius: '2px',
          width: 'fit-content',
          textShadow: isStagedSection ? '0 0 8px rgba(77, 147, 255, 0.4)' : 'none',
          textDecoration: (isStagedSection && file.stagedDeletion) ? 'line-through' : 'none',
          opacity: isUnmodified ? 0.6 : ((isStagedSection && file.stagedDeletion) ? 0.7 : 1)
        }}
      >
        {file.name}
        {(file.staged || (file.stagedDeletion && !file.deleted)) && !isStagedSection && (
          <span style={{ fontSize: '10px', color: 'var(--color-staged)', opacity: 0.8 }}>[staged]</span>
        )}
        {isStagedSection && file.stagedDeletion && (
          <span style={{ fontSize: (file.deleted ? '10px' : '9px'), color: 'var(--color-staged)', opacity: 0.8, textDecoration: 'none' }}>
             {file.deleted ? '(deleted)' : '(untracked)'}
          </span>
        )}
      </motion.div>
    );
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', overflowY: 'auto' }}>
      
      {/* Working Directory Section */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Working Directory</h2>
          <span style={{ 
            fontSize: '11px', 
            background: 'var(--color-staged)', 
            color: 'var(--bg-deep)', 
            padding: '2px 8px', 
            borderRadius: '12px', 
            fontWeight: 'bold',
            opacity: 0.9
          }}>
            <span style={{ opacity: 0.6 }}>branch:</span> {gitState.currentBranch}
          </span>
        </div>
        
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
            {stagedFiles.map(file => <FileItem key={file.name + (file.stagedDeletion ? '_del' : '_stg')} file={file} isStagedSection={true} />)}
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
