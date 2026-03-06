import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const HistoryGraph = ({ gitState }) => {
  const { history, activeCommit, currentBranch, branches } = gitState;
  const svgRef = useRef();

  useEffect(() => {
    if (!history || history.length === 0) return;

    const margin = { top: 60, right: 60, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`); 

    // Define colors for different branches
    const colorScale = d3.scaleOrdinal()
      .domain(branches || ['main'])
      .range(['#50fa7b', '#bd93f9', '#ff79c6', '#8be9fd', '#f1fa8c', '#ffb86c']);

    // Determine where each branch points (simulating Git branch refs)
    const branchHeads = {};
    if (branches) {
      branches.forEach(b => {
        const lastCommit = [...history].reverse().find(c => c.branch === b);
        if (lastCommit) {
          if (!branchHeads[lastCommit.id]) branchHeads[lastCommit.id] = [];
          branchHeads[lastCommit.id].push(b);
        } else if (b === currentBranch) {
          // If a new branch has no commits yet, it points to activeCommit
          if (!branchHeads[activeCommit]) branchHeads[activeCommit] = [];
          if (!branchHeads[activeCommit].includes(b)) {
             branchHeads[activeCommit].push(b);
          }
        }
      });
    }

    // Prepare link data
    const links = history
      .filter(d => d.parent)
      .map(d => {
        const source = history.find(p => p.id === d.parent);
        return { source, target: d };
      }).filter(l => l.source); // safety check

    // Draw Links
    g.selectAll('.link')
      .data(links)
      .join('path')
      .attr('class', 'link')
      .attr('d', d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        return `M${d.source.x},${d.source.y} C${d.source.x + dx/2},${d.source.y} ${d.source.x + dx/2},${d.target.y} ${d.target.x},${d.target.y}`;
      })
      .attr('fill', 'none')
      .attr('stroke', d => colorScale(d.target.branch))
      .attr('stroke-width', d => d.target.branch === currentBranch ? 3 : 2)
      .attr('opacity', d => d.target.branch === currentBranch ? 1 : 0.4);

    // Draw Nodes
    const node = g.selectAll('.node')
      .data(history)
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // Commit circle
    node.append('circle')
      .attr('r', 8)
      .attr('fill', d => d.id === activeCommit ? 'var(--bg-deep)' : colorScale(d.branch))
      .attr('stroke', d => colorScale(d.branch))
      .attr('stroke-width', d => d.id === activeCommit ? 3 : 1)
      .style('filter', d => d.id === activeCommit ? `drop-shadow(0 0 8px ${colorScale(d.branch)})` : 'none');

    // Commit ID text
    node.append('text')
      .attr('dy', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-secondary)')
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .text(d => d.id);

    // Branch tag labels
    const nodeWithLabels = node.filter(d => branchHeads[d.id] && branchHeads[d.id].length > 0);

    nodeWithLabels.append('text')
      .attr('dy', -20)
      .attr('text-anchor', 'middle')
      .attr('fill', d => branchHeads[d.id].includes(currentBranch) ? colorScale(currentBranch) : 'var(--text-secondary)')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .text(d => {
        const heads = branchHeads[d.id];
        if (heads.includes(currentBranch)) {
          const others = heads.filter(b => b !== currentBranch);
          return `* ${currentBranch}` + (others.length ? `, ${others.join(', ')}` : '');
        }
        return heads.join(', ');
      });

  }, [history, activeCommit, currentBranch, branches]);

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
