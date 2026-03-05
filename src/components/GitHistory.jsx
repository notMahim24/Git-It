import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const GitHistory = ({ gitState }) => {
  const { history, activeCommit, setActiveCommit } = gitState;
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Main history line
    svg.append("line")
      .attr("x1", 50)
      .attr("y1", height / 2)
      .attr("x2", width - 50)
      .attr("y2", height / 2)
      .attr("stroke", "rgba(80, 250, 123, 0.2)")
      .attr("stroke-width", 2);

    // Commit dots
    const commitNodes = history.filter(c => c.branch === 'main');
    const xStep = (width - 100) / (commitNodes.length || 1);

    const nodes = svg.selectAll(".commit")
      .data(commitNodes)
      .enter()
      .append("g")
      .attr("class", "commit")
      .attr("transform", (d, i) => `translate(${50 + i * xStep}, ${height / 2})`)
      .on("click", (event, d) => setActiveCommit(d.id));

    // Outer glow for active commit
    nodes.append("circle")
      .attr("r", 8)
      .attr("fill", "transparent")
      .attr("stroke", d => d.id === activeCommit ? "var(--color-staged)" : "transparent")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 0 4px var(--color-staged))");

    // Commit dot
    nodes.append("circle")
      .attr("r", 4)
      .attr("fill", "var(--color-committed)")
      .style("cursor", "pointer")
      .style("filter", "drop-shadow(0 0 5px var(--color-committed))");

    // Feature branch line (curving elegantly)
    const featureCommit = history.find(c => c.branch === 'feature');
    if (featureCommit) {
      const parentIndex = commitNodes.findIndex(c => c.id === featureCommit.parent);
      const startX = 50 + parentIndex * xStep;
      const endX = startX + xStep / 2;
      const endY = height / 2 - 60;

      const lineGenerator = d3.line().curve(d3.curveBasis);
      const pathData = lineGenerator([
        [startX, height / 2],
        [startX + xStep / 4, height / 2 - 10],
        [startX + xStep / 4, endY],
        [endX, endY]
      ]);

      svg.append("path")
        .attr("d", pathData)
        .attr("fill", "none")
        .attr("stroke", "rgba(80, 250, 123, 0.4)")
        .attr("stroke-width", 2);

      const featureNode = svg.append("g")
        .attr("transform", `translate(${endX}, ${endY})`)
        .on("click", () => setActiveCommit(featureCommit.id));

      featureNode.append("circle")
        .attr("r", 4)
        .attr("fill", "var(--color-committed)")
        .style("cursor", "pointer")
        .style("filter", "drop-shadow(0 0 5px var(--color-committed))");
        
      if (featureCommit.id === activeCommit) {
        featureNode.append("circle")
          .attr("r", 8)
          .attr("fill", "transparent")
          .attr("stroke", "var(--color-staged)")
          .attr("stroke-width", 2);
      }
    }

  }, [history, activeCommit, setActiveCommit]);

  return (
    <div className="glass-panel" style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <h2 style={{ position: 'absolute', top: '24px', left: '24px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Git History</h2>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default GitHistory;
