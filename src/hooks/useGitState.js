import { useState, useCallback } from "react";

export const useGitState = () => {
  const [files, setFiles] = useState([
    { name: "index.html", status: "tracked" },
    { name: "main.js", status: "modified" },
    { name: "style.css", status: "untracked" },
  ]);

  const [history, setHistory] = useState([
    { id: "c1", message: "Initial commit", branch: "main" },
    { id: "c2", message: "Add layout", branch: "main" },
    { id: "c3", message: "Fix styles", branch: "feature", parent: "c2" },
  ]);

  const [activeCommit, setActiveCommit] = useState("c2");

  const stageFile = useCallback((fileName) => {
    setFiles((prev) =>
      prev.map((f) => (f.name === fileName ? { ...f, status: "staged" } : f)),
    );
  }, []);

  const unstageFile = useCallback((fileName) => {
    setFiles((prev) =>
      prev.map((f) => (f.name === fileName ? { ...f, status: "modified" } : f)),
    );
  }, []);

  return {
    files,
    history,
    activeCommit,
    stageFile,
    unstageFile,
    setActiveCommit,
  };
};
