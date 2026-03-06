import { useState, useCallback } from 'react';

export const useGitState = () => {
  const [files, setFiles] = useState([
    { name: 'index.html', status: 'tracked', staged: false, deleted: false, stagedDeletion: false, wasUntracked: false },
    { name: 'main.js', status: 'modified', staged: false, deleted: false, stagedDeletion: false, wasUntracked: false },
    { name: 'style.css', status: 'untracked', staged: false, deleted: false, stagedDeletion: false, wasUntracked: false },
  ]);

  const [history, setHistory] = useState([
    { id: 'c1', message: 'Initial commit', branch: 'main', parent: null, x: 0, y: 0 },
    { id: 'c2', message: 'Add layout', branch: 'main', parent: 'c1', x: 100, y: 0 },
  ]);

  const [branches, setBranches] = useState(['main']);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [activeCommit, setActiveCommit] = useState('c2');

  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'output', text: 'Git Learning Lab v1.5.1 initialized.' },
    { type: 'output', text: 'Staging restricted: only modified or untracked files can be added.' }
  ]);

  const addOutput = (type, text) => {
    setTerminalOutput(prev => [...prev.slice(-50), { type, text }]);
  };

  const unstageFile = useCallback((name) => {
    setFiles(prev => prev.map(f => {
      if (f.name === name) {
        if (f.stagedDeletion) return { ...f, stagedDeletion: false, deleted: false, status: f.status === 'untracked' ? 'untracked' : 'modified' };
        if (f.wasUntracked) return { ...f, status: 'untracked', staged: false };
        return { ...f, staged: false };
      }
      return f;
    }));
  }, []);

  const executeCommand = useCallback((cmd) => {
    const parts = cmd.trim().split(/\s+/);
    const base = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (!base) return;

    addOutput('input', cmd);

    switch (base) {
      case 'git':
        const sub = args[0];
        if (sub === 'status') {
          const untracked = files.filter(f => f.status === 'untracked' && !f.staged && !f.deleted && !f.stagedDeletion).map(f => f.name);
          const modified = files.filter(f => f.status === 'modified' && !f.staged && !f.deleted).map(f => f.name);
          const staged = files.filter(f => f.staged || f.stagedDeletion);
          const deletedNotStaged = files.filter(f => f.deleted && !f.stagedDeletion);
          
          let out = `On branch ${currentBranch}\n`;
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

        } else if (sub === 'branch') {
          const newBranch = args[1];
          if (!newBranch) {
            addOutput('output', branches.map(b => b === currentBranch ? `* ${b}` : `  ${b}`).join('\n'));
          } else {
            if (branches.includes(newBranch)) {
              addOutput('output', `fatal: A branch named '${newBranch}' already exists.`);
            } else {
              setBranches(prev => [...prev, newBranch]);
              addOutput('output', `Branch '${newBranch}' created.`);
            }
          }

        } else if (sub === 'checkout' || sub === 'switch') {
          const isCheckoutB = (sub === 'checkout' && args[1] === '-b');
          const target = isCheckoutB ? args[2] : args[1];
          const createNew = isCheckoutB;

          if (!target) {
            addOutput('output', `fatal: No branch specified.`);
            return;
          }

          if (createNew) {
            if (branches.includes(target)) {
              addOutput('output', `fatal: A branch named '${target}' already exists.`);
            } else {
              setBranches(prev => [...prev, target]);
              setCurrentBranch(target);
              addOutput('output', `Switched to a new branch '${target}'`);
            }
          } else {
            if (branches.includes(target)) {
              setCurrentBranch(target);
              addOutput('output', `Switched to branch '${target}'`);
            } else {
              addOutput('output', `error: pathspec '${target}' did not match any file(s) known to git`);
            }
          }

        } else if (sub === 'add') {
          const target = args[1];
          if (!target) {
            addOutput('output', 'Nothing specified, nothing added.');
            return;
          }

          setFiles(prev => {
            const affected = prev.filter(f => (target === '.' || target === '*' || f.name === target));
            const hasModified = affected.some(f => f.status === 'modified' || f.status === 'untracked' || f.deleted);
            
            if (!hasModified && target !== '.' && target !== '*') {
              addOutput('output', `Nothing to add for '${target}' (tracked and unmodified).`);
              return prev;
            }

            return prev.map(f => {
              if (target === '.' || target === '*' || f.name === target) {
                // Guard: Only stage if not unmodified tracked
                if (f.status === 'tracked' && !f.deleted && !f.stagedDeletion) return f;
                
                if (f.deleted) return { ...f, stagedDeletion: true, staged: false };
                if (f.status === 'untracked') return { ...f, status: 'modified', staged: true, wasUntracked: true, stagedDeletion: false };
                return { ...f, staged: true, stagedDeletion: false };
              }
              return f;
            });
          });

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
            setHistory(hPrev => {
              const lastOnBranch = [...hPrev].reverse().find(c => c.branch === currentBranch);
              const parent = lastOnBranch ? lastOnBranch.id : activeCommit;
              const parentCommit = hPrev.find(c => c.id === parent);
              
              const newX = parentCommit ? parentCommit.x + 100 : hPrev.length * 100;
              const newY = currentBranch === 'main' ? 0 : -40;

              return [...hPrev, { 
                id: newId, 
                message: msg, 
                branch: currentBranch, 
                parent: parent,
                x: newX,
                y: newY
              }];
            });
            setActiveCommit(newId);
            addOutput('output', `[${currentBranch} ${newId}] ${msg}\n ${stagedFiles.length} files changed`);
            
            return prev
              .filter(f => !(f.stagedDeletion && f.deleted))
              .map(f => {
                  if (f.stagedDeletion && !f.deleted) return { ...f, status: 'untracked', stagedDeletion: false, wasUntracked: true };
                  if (f.staged) return { ...f, status: 'tracked', staged: false, wasUntracked: false };
                  return f;
              });
          });
        } else if (sub === 'restore' && args[1] === '--staged') {
          const target = args[2];
          setFiles(prev => prev.map(f => {
            if (target === '.' || target === '*' || f.name === target) {
              if (f.stagedDeletion) return { ...f, stagedDeletion: false, deleted: false, status: f.status === 'untracked' ? 'untracked' : 'modified' };
              if (f.wasUntracked) return { ...f, status: 'untracked', staged: false };
              return { ...f, staged: false };
            }
            return f;
          }));
        } else if (sub === 'reset' && args[1]?.toLowerCase() === 'head') {
          const target = args[2];
          setFiles(prev => prev.map(f => {
            if (!target || target === '.' || target === '*' || f.name === target) {
              if (f.stagedDeletion) return { ...f, stagedDeletion: false, deleted: false, status: f.status === 'untracked' ? 'untracked' : 'modified' };
              if (f.wasUntracked) return { ...f, status: 'untracked', staged: false };
              return { ...f, staged: false };
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

          const targetFile = files.find(f => f.name === target);
          if (!targetFile || (targetFile.status === 'untracked' && !targetFile.staged)) {
              addOutput('output', `fatal: pathspec '${target}' did not match any files`);
              return;
          }

          setFiles(prev => {
              const fileToRm = prev.find(f => f.name === target);
              if (fileToRm.wasUntracked) {
                  if (cached) return prev.map(f => f.name === target ? { ...f, status: 'untracked', staged: false, stagedDeletion: false } : f);
                  return prev.filter(f => f.name !== target);
              }
              return prev.map(f => {
                if (f.name === target) {
                  if (cached) return { ...f, status: 'untracked', stagedDeletion: true, staged: false, deleted: false };
                  return { ...f, deleted: true, stagedDeletion: true, staged: false };
                }
                return f;
              });
          });
          addOutput('output', `rm '${target}'`);
        }
        break;

      case 'ls':
        addOutput('output', files.filter(f => !f.deleted).map(f => f.name).join('  '));
        break;

      case 'touch':
        if (args[0]) {
          setFiles(prev => {
            if (prev.some(f => f.name === args[0])) {
              return prev.map(f => f.name === args[0] ? { ...f, deleted: false, status: f.status === 'untracked' ? 'untracked' : 'modified' } : f);
            }
            return [...prev, { name: args[0], status: 'untracked', staged: false, deleted: false, stagedDeletion: false, wasUntracked: true }];
          });
        }
        break;

      case 'clear':
        setTerminalOutput([]);
        break;

      default:
        addOutput('output', `command not found: ${base}`);
    }
  }, [files, history, activeCommit, currentBranch, branches]);

  const stageFile = useCallback((name) => {
    setFiles(prev => {
        const file = prev.find(f => f.name === name);
        // Guard: Prevent staging unmodified tracked files via UI
        if (file && file.status === 'tracked' && !file.deleted && !file.stagedDeletion) {
            return prev;
        }

        return prev.map(f => {
            if (f.name === name) {
                if (f.deleted) return { ...f, stagedDeletion: true };
                if (f.status === 'untracked') return { ...f, status: 'modified', staged: true, wasUntracked: true };
                return { ...f, staged: true };
            }
            return f;
        });
    });
  }, []);

  return {
    files,
    history,
    branches,
    currentBranch,
    activeCommit,
    terminalOutput,
    executeCommand,
    stageFile,
    unstageFile,
    setActiveCommit
  };
};
