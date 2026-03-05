import { useState, useCallback } from 'react';

export const useGitState = () => {
  const [files, setFiles] = useState([
    { name: 'index.html', status: 'tracked', staged: false, deleted: false, stagedDeletion: false },
    { name: 'main.js', status: 'modified', staged: false, deleted: false, stagedDeletion: false },
    { name: 'style.css', status: 'untracked', staged: false, deleted: false, stagedDeletion: false },
  ]);

  const [history, setHistory] = useState([
    { id: 'c1', message: 'Initial commit', branch: 'main' },
    { id: 'c2', message: 'Add layout', branch: 'main' },
  ]);

  const [activeCommit, setActiveCommit] = useState('c2');
  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'output', text: 'Git Learning Lab v1.3.1 initialized.' },
    { type: 'output', text: 'Refined staging & removal transitions active.' }
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
        addOutput('output', files.filter(f => !f.deleted).map(f => f.name).join('  '));
        break;

      case 'touch':
        if (args[0]) {
          setFiles(prev => {
            if (prev.some(f => f.name === args[0])) {
              return prev.map(f => f.name === args[0] ? { ...f, deleted: false, status: f.status === 'untracked' ? 'untracked' : 'modified' } : f);
            }
            return [...prev, { name: args[0], status: 'untracked', staged: false, deleted: false, stagedDeletion: false }];
          });
        }
        break;

      case 'git':
        const sub = args[0];
        if (sub === 'status') {
          const untracked = files.filter(f => f.status === 'untracked' && !f.staged && !f.deleted && !f.stagedDeletion).map(f => f.name);
          const modified = files.filter(f => f.status === 'modified' && !f.staged && !f.deleted).map(f => f.name);
          const staged = files.filter(f => f.staged || f.stagedDeletion);
          const deletedNotStaged = files.filter(f => f.deleted && !f.stagedDeletion);
          
          let out = "On branch main\n";
          if (staged.length) {
            out += `\nChanges to be committed:\n`;
            staged.forEach(f => {
              const statusLine = f.stagedDeletion ? `deleted:    ${f.name}` : (f.wasUntracked ? `new file:   ${f.name}` : `modified:   ${f.name}`);
              out += `\t${statusLine}\n`;
            });
          }
          if (modified.length || deletedNotStaged.length) {
            out += `\nChanges not staged for commit:\n`;
            modified.forEach(name => out += `\tmodified:   ${name}\n`);
            deletedNotStaged.forEach(f => out += `\tdeleted:    ${f.name}\n`);
          }
          if (untracked.length) out += `\nUntracked files:\n\t${untracked.join('\n\t')}\n`;
          if (!staged.length && !modified.length && !untracked.length && !deletedNotStaged.length) out += "nothing to commit, working tree clean";
          addOutput('output', out);
        } else if (sub === 'add') {
          const target = args[1];
          if (!target) {
            addOutput('output', 'Nothing specified, nothing added.');
            return;
          }
          setFiles(prev => prev.map(f => {
            if (target === '.' || target === '*' || f.name === target) {
              if (f.deleted) {
                  return { ...f, stagedDeletion: true, staged: false };
              }
              if (f.status === 'untracked') {
                return { ...f, status: 'modified', staged: true, wasUntracked: true, stagedDeletion: false };
              }
              return { ...f, staged: true, stagedDeletion: false };
            }
            return f;
          }));
        } else if (sub === 'rm') {
          let target = args[1];
          let cached = false;
          if (args[1] === '--cached') {
              cached = true;
              target = args[2];
          }

          if (!target) {
            addOutput('output', 'fatal: No pathspec magic not supported');
            return;
          }

          setFiles(prev => prev.map(f => {
            if (f.name === target) {
              if (cached) {
                // git rm --cached: keep in WD (deleted: false), move to untracked, stage deletion
                return { ...f, status: 'untracked', stagedDeletion: true, staged: false, deleted: false };
              } else {
                // git rm: remove from WD, stage deletion
                return { ...f, deleted: true, stagedDeletion: true, staged: false };
              }
            }
            return f;
          }));
          addOutput('output', `rm '${target}'`);
        } else if (sub === 'commit') {
          const msgIdx = args.indexOf('-m');
          const msg = msgIdx !== -1 && args[msgIdx + 1] ? args.slice(msgIdx + 1).join(' ').replace(/"/g, '') : "update";
          
          setFiles(prev => {
            const stagedFiles = prev.filter(f => f.staged || f.stagedDeletion);
            if (stagedFiles.length === 0) {
              addOutput('output', 'nothing to commit, working tree clean');
              return prev;
            }
            
            const newId = 'c' + (Math.random().toString(36).substr(2, 4));
            setHistory(hPrev => [...hPrev, { id: newId, message: msg, branch: 'main', parent: activeCommit }]);
            setActiveCommit(newId);
            addOutput('output', `[main ${newId}] ${msg}\n ${stagedFiles.length} files changed`);
            
            // Remove files that were committed as deleted
            return prev
              .filter(f => !f.stagedDeletion)
              .map(f => f.staged ? { ...f, status: 'tracked', staged: false, wasUntracked: false } : f);
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
            if (f.deleted) return { ...f, stagedDeletion: true };
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
            if (f.stagedDeletion && f.status === 'untracked') {
                return { ...f, stagedDeletion: false, status: 'tracked' }; // or stay modified
            }
            if (f.stagedDeletion) {
                return { ...f, stagedDeletion: false };
            }
            if (f.wasUntracked && !f.deleted) {
                return { ...f, status: 'untracked', staged: false };
            }
            return { ...f, staged: false };
        }
        return f;
    }));
  }, []);

  const workingFiles = files.filter(f => !f.deleted);
  const stagedFiles = files.filter(f => f.staged || f.stagedDeletion);

  return {
    files,
    workingFiles,
    stagedFiles,
    history,
    activeCommit,
    terminalOutput,
    executeCommand,
    stageFile,
    unstageFile,
    setActiveCommit
  };
};
