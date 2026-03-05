import { useState, useCallback } from 'react';

export const useGitState = () => {
  const [files, setFiles] = useState([
    { name: 'index.html', status: 'tracked', staged: false },
    { name: 'main.js', status: 'modified', staged: false },
    { name: 'style.css', status: 'untracked', staged: false },
  ]);

  const [history, setHistory] = useState([
    { id: 'c1', message: 'Initial commit', branch: 'main' },
    { id: 'c2', message: 'Add layout', branch: 'main' },
  ]);

  const [activeCommit, setActiveCommit] = useState('c2');
  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'output', text: 'Git Learning Lab v1.1.0 initialized.' },
    { type: 'output', text: 'Enhanced Working Directory state active.' }
  ]);

  const addOutput = (type, text) => {
    setTerminalOutput(prev => [...prev.slice(-50), { type, text }]);
  };

  const executeCommand = useCallback((cmd) => {
    const parts = cmd.trim().split(/\s+/);
    const base = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (!base) return;

    addOutput('input', cmd);

    switch (base) {
      case 'ls':
        addOutput('output', files.map(f => f.name).join('  '));
        break;

      case 'touch':
        if (args[0]) {
          setFiles(prev => {
            if (prev.some(f => f.name === args[0])) {
              // Mark as modified if it exists
              return prev.map(f => f.name === args[0] ? { ...f, status: f.status === 'untracked' ? 'untracked' : 'modified' } : f);
            }
            return [...prev, { name: args[0], status: 'untracked', staged: false }];
          });
        }
        break;

      case 'rm':
        if (args[0]) {
          setFiles(prev => prev.filter(f => f.name !== args[0]));
        }
        break;

      case 'mkdir':
        if (args[0]) {
          const dirName = args[0].endsWith('/') ? args[0] : args[0] + '/';
          setFiles(prev => {
            if (prev.some(f => f.name === dirName)) return prev;
            return [...prev, { name: dirName, status: 'tracked', staged: false }];
          });
        }
        break;

      case 'git':
        const sub = args[0];
        if (sub === 'status') {
          const untracked = files.filter(f => f.status === 'untracked').map(f => f.name);
          const modified = files.filter(f => f.status === 'modified').map(f => f.name);
          const staged = files.filter(f => f.staged).map(f => f.name);
          
          let out = "On branch main\n";
          if (staged.length) out += `\nChanges to be committed:\n\t${staged.join('\n\t')}\n`;
          if (modified.length) out += `\nChanges not staged for commit:\n\t${modified.join('\n\t')}\n`;
          if (untracked.length) out += `\nUntracked files:\n\t${untracked.join('\n\t')}\n`;
          if (!staged.length && !modified.length && !untracked.length) out += "nothing to commit, working tree clean";
          addOutput('output', out);
        } else if (sub === 'add') {
          const target = args[1];
          if (!target) {
            addOutput('output', 'Nothing specified, nothing added.');
            return;
          }
          setFiles(prev => prev.map(f => {
            if (target === '.' || target === '*' || f.name === target) {
              return { ...f, staged: true };
            }
            return f;
          }));
        } else if (sub === 'commit') {
          const msgIdx = args.indexOf('-m');
          const msg = msgIdx !== -1 && args[msgIdx + 1] ? args.slice(msgIdx + 1).join(' ').replace(/"/g, '') : "update";
          
          setFiles(prev => {
            const stagedCount = prev.filter(f => f.staged).length;
            if (stagedCount === 0) {
              addOutput('output', 'nothing to commit, working tree clean');
              return prev;
            }
            
            const newId = 'c' + (Math.random().toString(36).substr(2, 4));
            setHistory(hPrev => [...hPrev, { id: newId, message: msg, branch: 'main', parent: activeCommit }]);
            setActiveCommit(newId);
            addOutput('output', `[main ${newId}] ${msg}\n ${stagedCount} files changed`);
            
            return prev.map(f => f.staged ? { ...f, status: 'tracked', staged: false } : f);
          });
        } else if (sub === 'checkout') {
          const target = args[1];
          const commit = history.find(c => c.id === target || c.branch === target);
          if (commit) {
            setActiveCommit(commit.id);
            addOutput('output', `Switched to commit ${commit.id}`);
          } else {
            addOutput('output', `error: pathspec '${target}' did not match any commit`);
          }
        }
        break;

      case 'clear':
        setTerminalOutput([]);
        break;

      default:
        addOutput('output', `command not found: ${base}`);
    }
  }, [files, history, activeCommit]);

  return {
    files,
    history,
    activeCommit,
    terminalOutput,
    executeCommand,
    stageFile: (name) => setFiles(prev => prev.map(f => f.name === name ? { ...f, staged: true } : f)),
    unstageFile: (name) => setFiles(prev => prev.map(f => f.name === name ? { ...f, staged: false } : f)),
    setActiveCommit
  };
};
