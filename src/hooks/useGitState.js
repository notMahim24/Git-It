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
    { type: 'output', text: 'Git Learning Lab v1.2.0 initialized.' },
    { type: 'output', text: 'Staging logic updated: Untracked files move to Tracked section.' }
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
          if (staged.length) {
            out += `\nChanges to be committed:\n`;
            staged.forEach(name => {
              const file = files.find(f => f.name === name);
              // In this logic, if it was untracked and staged, it became 'modified' or similar
              // but we need to know if it was originally untracked. 
              // For simplicity, let's check a property he didn't ask for but we need.
              const statusLine = file.wasUntracked ? `new file:   ${name}` : `modified:   ${name}`;
              out += `\t${statusLine}\n`;
            });
          }
          if (modified.length) out += `\nChanges not staged for commit:\n\tmodified:   ${modified.join('\n\tmodified:   ')}\n`;
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
              // If untracked, move to modified (tracked) and mark it was untracked
              if (f.status === 'untracked') {
                return { ...f, status: 'modified', staged: true, wasUntracked: true };
              }
              return { ...f, staged: true };
            }
            return f;
          }));
        } else if (sub === 'reset') {
            // Add basic reset to demo un-staging
            const target = args[0] === 'reset' ? args[1] : null;
            setFiles(prev => prev.map(f => {
                if (target === '.' || f.name === target) {
                    if (f.wasUntracked) {
                        return { ...f, status: 'untracked', staged: false, wasUntracked: true };
                    }
                    return { ...f, staged: false };
                }
                return f;
            }));
        } else if (sub === 'commit') {
          const msgIdx = args.indexOf('-m');
          const msg = msgIdx !== -1 && args[msgIdx + 1] ? args.slice(msgIdx + 1).join(' ').replace(/"/g, '') : "update";
          
          setFiles(prev => {
            const stagedFiles = prev.filter(f => f.staged);
            if (stagedFiles.length === 0) {
              addOutput('output', 'nothing to commit, working tree clean');
              return prev;
            }
            
            const newId = 'c' + (Math.random().toString(36).substr(2, 4));
            setHistory(hPrev => [...hPrev, { id: newId, message: msg, branch: 'main', parent: activeCommit }]);
            setActiveCommit(newId);
            addOutput('output', `[main ${newId}] ${msg}\n ${stagedFiles.length} files changed`);
            
            return prev.map(f => f.staged ? { ...f, status: 'tracked', staged: false, wasUntracked: false } : f);
          });
        }
        break;

      case 'clear':
        setTerminalOutput([]);
        break;

      default:
        addOutput('output', `command not found: ${base}`);
    }
  }, [files, history, activeCommit]);

  const stageFile = useCallback((name) => {
    setFiles(prev => prev.map(f => {
        if (f.name === name) {
            if (f.status === 'untracked') {
                return { ...f, status: 'modified', staged: true, wasUntracked: true };
            }
            return { ...f, staged: true };
        }
        return f;
    }));
  }, []);

  const unstageFile = useCallback((name) => {
    setFiles(prev => prev.map(f => {
        if (f.name === name) {
            if (f.wasUntracked) {
                return { ...f, status: 'untracked', staged: false };
            }
            return { ...f, staged: false };
        }
        return f;
    }));
  }, []);

  return {
    files,
    history,
    activeCommit,
    terminalOutput,
    executeCommand,
    stageFile,
    unstageFile,
    setActiveCommit
  };
};
