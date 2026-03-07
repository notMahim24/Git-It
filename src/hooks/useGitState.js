import { useState, useCallback } from 'react';

export const useGitState = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [files, setFiles] = useState([]);

  const [history, setHistory] = useState([]);

  const [branchRefs, setBranchRefs] = useState({ main: null });
  const [currentBranch, setCurrentBranch] = useState('main');
  const [activeCommit, setActiveCommit] = useState(null);

  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'output', text: 'Welcome to Git Learning Lab!\nPlease initialize your repository by typing: git init' }
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

  const checkoutCommit = useCallback((targetId, branchName = null) => {
    const targetCommit = history.find(c => c.id === targetId);
    if (!targetCommit) return false;

    // Restore the exact file snapshot of that commit
    setFiles(JSON.parse(JSON.stringify(targetCommit.snapshot)));
    setActiveCommit(targetId);

    if (branchName) {
      setCurrentBranch(branchName);
    } else {
      const matchingBranch = Object.keys(branchRefs).find(b => branchRefs[b] === targetId);
      setCurrentBranch(matchingBranch || targetCommit.branch);
    }
    return true;
  }, [history, branchRefs]);

  const executeCommand = useCallback((cmd) => {
    const parts = cmd.trim().split(/\s+/);
    const base = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (!base) return;

    addOutput('input', cmd);

    if (base === 'clear') {
      setTerminalOutput([]);
      return;
    }

    if (!isInitialized) {
      if (base === 'git' && args[0] === 'init') {
        setIsInitialized(true);
        addOutput('output', `Initialized empty Git repository in /home/user/project/.git/`);
      } else {
        addOutput('output', `fatal: not a git repository. Please type 'git init' to start.`);
      }
      return;
    }

    switch (base) {
      case 'git':
        const sub = args[0];
        if (sub === 'init') {
          addOutput('output', `Reinitialized existing Git repository in /home/user/project/.git/`);
        } else if (sub === 'commands') {
          const helpText = `Available Commands:
  git init                  - Initialize a new Git repository
  git status                - Show the working tree status
  git add <file>/.          - Add file contents to the index
  git commit -m "<msg>"     - Record changes to the repository
  git branch                - List, create, or delete branches
  git branch <name>         - Create a new branch
  git branch -d <name>      - Delete a branch
  git checkout <branch>     - Switch branches or restore files
  git checkout -b <name>    - Create and switch to a new branch
  git switch <branch>       - Switch branches
  git switch -c <name>      - Create and switch to a new branch
  git restore --staged <f>  - Restore file in index from HEAD
  git reset HEAD <file>     - Remove file from the staging area
  git rm <file>             - Remove file from the working tree
  git rm --cached <file>    - Stop tracking a file
  git log                   - Show commit history
  touch <file>              - Create a file or update timestamp
  ls                        - List directory contents
  clear                     - Clear the terminal screen
  git commands              - Show this help message`;
          addOutput('output', helpText);
        } else if (sub === 'log') {
          if (!activeCommit) {
            addOutput('output', `fatal: your current branch '${currentBranch}' does not have any commits yet`);
          } else {
            let curr = activeCommit;
            let logLines = [];
            while (curr) {
               const commit = history.find(c => c.id === curr);
               if (!commit) break;
               
               // Determine any branch tags pointing to this commit
               const tags = Object.keys(branchRefs).filter(b => branchRefs[b] === commit.id);
               let tagStr = '';
               if (curr === activeCommit) tags.unshift('HEAD');
               if (tags.length > 0) {
                 tagStr = ` (${tags.join(', ')})`;
               }

               logLines.push(`* ${commit.id}${tagStr} - ${commit.message}`);
               curr = commit.parent;
            }
            addOutput('output', logLines.join('\n'));
          }
        } else if (sub === 'status') {
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
          if (args[1] === '-d' || args[1] === '-D') {
             const target = args[2];
             if (!target) {
               addOutput('output', `error: branch name required`);
             } else if (!branchRefs[target]) {
               addOutput('output', `error: branch '${target}' not found.`);
             } else if (target === currentBranch) {
               addOutput('output', `error: Cannot delete branch '${target}' checked out at '${activeCommit}'`);
             } else {
               setBranchRefs(prev => {
                 const updated = { ...prev };
                 delete updated[target];
                 return updated;
               });
               addOutput('output', `Deleted branch ${target} (was ${branchRefs[target]}).`);
             }
          } else {
             const newBranch = args[1];
             if (!newBranch) {
               addOutput('output', Object.keys(branchRefs).map(b => b === currentBranch ? `* ${b}` : `  ${b}`).join('\n'));
             } else {
               if (branchRefs[newBranch]) {
                 addOutput('output', `fatal: A branch named '${newBranch}' already exists.`);
               } else {
                 setBranchRefs(prev => ({ ...prev, [newBranch]: activeCommit }));
                 addOutput('output', `Branch '${newBranch}' created.`);
               }
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
            if (branchRefs[target]) {
               addOutput('output', `fatal: A branch named '${target}' already exists.`);
            } else {
               setBranchRefs(prev => ({ ...prev, [target]: activeCommit }));
               setCurrentBranch(target); 
               addOutput('output', `Switched to a new branch '${target}'`);
            }
          } else {
            // Target could be a branch or a commit hash
            let hashToCheckout = null;
            let isBranch = false;
            
            if (branchRefs[target]) {
               hashToCheckout = branchRefs[target];
               isBranch = true;
            } else if (history.find(c => c.id === target)) {
               hashToCheckout = target;
            }

            if (hashToCheckout && checkoutCommit(hashToCheckout, isBranch ? target : null)) {
               addOutput('output', isBranch ? `Switched to branch '${target}'` : `Note: switching to '${target}'.\nYou are in 'detached HEAD' state.`);
            } else {
               addOutput('output', `error: pathspec '${target}' did not match any file(s) known to git`);
            }
          }

        } else if (sub === 'add') {
          const targets = args.slice(1);
          if (targets.length === 0) {
            addOutput('output', 'Nothing specified, nothing added.');
            return;
          }

          setFiles(prev => {
            const hasAll = targets.includes('.') || targets.includes('*');
            const affected = prev.filter(f => (hasAll || targets.includes(f.name)));
            const hasModified = affected.some(f => f.status === 'modified' || f.status === 'untracked' || f.deleted);
            
            if (!hasModified && !hasAll) {
              addOutput('output', `Nothing to add for '${targets.join(', ')}' (tracked and unmodified).`);
              return prev;
            }

            return prev.map(f => {
              if (hasAll || targets.includes(f.name)) {
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
          
          if (branchRefs[currentBranch] !== activeCommit) {
            addOutput('output', `fatal: You are not at the tip of a branch.\nPlease create a new branch using 'git checkout -b <branch-name>' before committing your changes.`);
            return;
          }

          const stagedFiles = files.filter(f => f.staged || f.stagedDeletion);
          if (stagedFiles.length === 0) {
            addOutput('output', 'nothing to commit, working tree clean');
            return;
          }
          
          const branchIndex = Object.keys(branchRefs).indexOf(currentBranch);
          const prefix = String.fromCharCode(99 + (branchIndex !== -1 ? branchIndex : 0));
          const branchCommitCount = history.filter(c => c.branch === currentBranch).length;
          const newId = prefix + (branchCommitCount + 1);
          
          const nextFiles = files
            .filter(f => !(f.stagedDeletion && f.deleted))
            .map(f => {
                if (f.stagedDeletion && !f.deleted) return { ...f, status: 'untracked', stagedDeletion: false, wasUntracked: true };
                if (f.staged) return { ...f, status: 'tracked', staged: false, wasUntracked: false };
                return f;
            });

          setHistory(hPrev => {
            if (hPrev.some(c => c.id === newId)) return hPrev; // Guard for React StrictMode double-invocation

            const parent = activeCommit;
            const parentCommit = hPrev.find(c => c.id === parent);
            
            const newX = parentCommit ? parentCommit.x + 100 : hPrev.length * 100;
            const bIdx = Object.keys(branchRefs).indexOf(currentBranch);
            const newY = bIdx <= 0 ? 0 : (Math.ceil(bIdx / 2) * 60 * (bIdx % 2 === 0 ? 1 : -1));

            // The snapshot is only tracked files, not untracked or active modifications
            const snapshot = nextFiles
              .filter(f => f.status === 'tracked' && !f.deleted && !f.stagedDeletion)
              .map(f => ({ ...f }));

            return [...hPrev, { 
              id: newId, 
              message: msg, 
              branch: currentBranch, 
              parent: parent,
              x: newX,
              y: newY,
              snapshot: snapshot
            }];
          });

          setActiveCommit(newId);
          setBranchRefs(prev => ({ ...prev, [currentBranch]: newId }));

          
          addOutput('output', `[${currentBranch} ${newId}] ${msg}\n ${stagedFiles.length} files changed`);
          setFiles(nextFiles);
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

    // Clear logic moved up to immediately execute without being gated by initialization


      default:
        addOutput('output', `command not found: ${base}`);
    }
  }, [isInitialized, files, history, activeCommit, currentBranch, branchRefs, checkoutCommit]);

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
    isInitialized,
    files,
    history,
    branches: Object.keys(branchRefs),
    branchRefs,
    currentBranch,
    activeCommit,
    terminalOutput,
    executeCommand,
    stageFile,
    unstageFile,
    checkoutCommit,
    setActiveCommit
  };
};
