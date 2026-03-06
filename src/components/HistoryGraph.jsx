import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const HistoryGraph = ({ gitState }) => {
  const { history, activeCommit, currentBranch } = gitState;
  const svgRef = useRef();

  useEffect(() => {
    if (!history || history.length === 0) return;

    const margin = { top: 60, right: 60, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${height / 2 + margin.top})`);

    // Define colors
    const colors = {
      main: '#50fa7b', // Neon Green
      feature: '#bd93f9', // Purple
      default: '#8be9fd', // Cyan
    };

    // Prepare link data
    const links = history
      .filter(d => d.parent)
      .map(d => {
        const source = history.find(p => p.id === d.parent);
        return { source, target: d };
      });

    // Draw Links
    g.selectAll('.link')
      .data(links)
      .join('path')
      .attr('class', 'link')
      .attr('d', d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        // Use a curved link for branching
        return `M${d.source.x},${d.source.y} C${d.source.x + dx/2},${d.source.y} ${d.source.x + dx/2},${d.target.y} ${d.target.x},${d.target.y}`;
      })
      .attr('fill', 'none')
      .attr('stroke', d => d.target.branch === 'main' ? 'var(--color-committed)' : 'var(--color-staged)')
      .attr('stroke-width', 2)
      .attr('opacity', 0.6);

    // Draw Nodes
    const node = g.selectAll('.node')
      .data(history)
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // Commit circle
    node.append('circle')
      .attr('r', 8)
      .attr('fill', d => d.id === activeCommit ? 'var(--bg-card)' : 'var(--color-committed)')
      .attr('stroke', d => d.id === activeCommit ? 'var(--color-staged)' : 'var(--color-committed)')
      .attr('stroke-width', d => d.id === activeCommit ? 3 : 1)
      .style('filter', d => d.id === activeCommit ? 'drop-shadow(0 0 8px var(--color-staged))' : 'none');

    // Commit ID / Branch label
    node.append('text')
      .attr('dy', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-secondary)')
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .text(d => d.id);

    // Branch tag (if it's the head of a branch or the active commit)
    const heads = history.reduce((acc, curr) => {
        acc[curr.branch] = curr.id;
        return acc;
    }, {});

    node.filter(d => Object.values(heads).includes(d.id))
      .append('text')
      .attr('dy', -20)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.branch === currentBranch ? 'var(--color-staged)' : 'var(--text-secondary)')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .text(d => d.branch);

  }, [history, activeCommit, currentBranch]);

  return (
    <div className="glass-panel" style={{ height: '100%', position: 'relative', overflowX: 'auto', overflowY: 'hidden' }}>
      <div style={{ position: 'absolute', top: '16px', left: '24px', zIndex: 10 }}>
        <h2 style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Git History</h2>
      </div>
      <svg ref={svgRef} width="1500" height="400" style={{ transform: 'scale(1)', transformOrigin: 'left center' }}></svg>
    </div>
  );
};

export default HistoryGraph;
