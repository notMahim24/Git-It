import React from 'react';
import { motion } from 'framer-motion';
import { Play, Coffee, Zap, GitBranch } from 'lucide-react';

const LandingPage = ({ onSelectMode }) => {
  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #1a1a1e 0%, #0a0a0b 100%)',
      color: 'var(--text-primary)',
      overflow: 'hidden',
      padding: '40px'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', marginBottom: '60px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
          <GitBranch size={48} color="var(--color-active)" />
          <h1 style={{ fontSize: '64px', fontWeight: 'bold', letterSpacing: '-2px' }}>Git It</h1>
        </div>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '500px' }}>
          Master the world's most popular version control system through interactive visualization.
        </p>
      </motion.div>

      <div style={{ display: 'flex', gap: '32px', maxWidth: '1000px', width: '100%' }}>
        {/* Free Mode Card */}
        <motion.div
          whileHover={{ scale: 1.02, translateY: -10 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectMode('free')}
          className="glass-panel"
          style={{
            flex: 1,
            padding: '40px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            transition: 'var(--transition-smooth)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ 
            position: 'absolute', 
            top: '-20px', 
            right: '-20px', 
            width: '100px', 
            height: '100px', 
            background: 'var(--color-active)', 
            filter: 'blur(60px)', 
            opacity: 0.2 
          }} />
          <Coffee size={40} color="var(--text-secondary)" />
          <div>
            <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Free Mode</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              A limitless sandbox where you can experiment with any Git command. No rules, just exploration.
            </p>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-active)' }}>
            <span>Start Exploring</span>
            <Zap size={16} />
          </div>
        </motion.div>

        {/* Game Mode Card */}
        <motion.div
          whileHover={{ scale: 1.02, translateY: -10 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectMode('game')}
          className="glass-panel"
          style={{
            flex: 1,
            padding: '40px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            transition: 'var(--transition-smooth)',
            border: '1px solid rgba(80, 250, 123, 0.2)'
          }}
        >
          <div style={{ 
            position: 'absolute', 
            top: '-20px', 
            right: '-20px', 
            width: '100px', 
            height: '100px', 
            background: 'var(--color-modified)', 
            filter: 'blur(60px)', 
            opacity: 0.2 
          }} />
          <Play size={40} color="var(--color-modified)" />
          <div>
            <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Game Mode</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Master Git through structured challenges. Complete objectives to unlock the next level.
            </p>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-modified)' }}>
            <span>Start Journey</span>
            <Play size={16} fill="currentColor" />
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        style={{ position: 'fixed', bottom: '40px', fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.5 }}
      >
        PRESS ANY CARD TO BEGIN
      </motion.div>
    </div>
  );
};

export default LandingPage;
