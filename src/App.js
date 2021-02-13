import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import * as d3 from 'd3';

export default function App() {
  // const [data, setData] = useState([12, 6, 6, 7, 10]);
  const [data, setData] = useState([]);

  const svgRef = useRef();

  useEffect(() => {
    let array = [];
    d3.csv('/alphabet.csv', ({ letter, frequency }) => {
      return { name: letter, value: frequency };
    }).then((d) => setData(d));

    setData(array);
  }, []);

  useEffect(() => {
    const width = 600;
    const height = 200;

    let margin = { top: 20, right: 0, bottom: 30, left: 40 };
    let yAxis = (g) =>
      g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call((g) => g.select('.domain').remove());

    let xAxis = (g) =>
      g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

    let y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    let x = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    function zoom(svg) {
      const extent = [
        [margin.left, margin.top],
        [width - margin.right, height - margin.top],
      ];

      svg.call(
        d3
          .zoom()
          .scaleExtent([1, 8])
          .translateExtent(extent)
          .extent(extent)
          .on('zoom', zoomed),
      );

      function zoomed(event) {
        x.range(
          [margin.left, width - margin.right].map((d) =>
            event.transform.applyX(d),
          ),
        );
        svg
          .selectAll('.bars rect')
          .attr('x', (d) => x(d.name))
          .attr('width', x.bandwidth());
        svg.selectAll('.x-axis').call(xAxis);
      }
    }

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
      .call(zoom);

    svg
      .append('g')
      .attr('class', 'bars')
      .attr('fill', 'steelblue')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d) => x(d.name))
      .attr('y', (d) => y(d.value))
      .attr('height', (d) => y(0) - y(d.value))
      .attr('width', x.bandwidth());

    svg.append('g').attr('class', 'x-axis').call(xAxis);

    svg.append('g').attr('class', 'y-axis').call(yAxis);

    return svg.node();

    // -------------------------------

    // const svg = d3
    //   .select(svgRef.current)
    //   .attr('width', width)
    //   .attr('height', height)
    //   .style('margin-left', 120);

    // svg
    //   .selectAll('rect')
    //   .data(data)
    //   .enter()
    //   .append('rect')
    //   .attr('x', (d, i) => i * 50)
    //   .attr('y', (d, i) => height - 10 * d)
    //   .attr('width', 30)
    //   .attr('height', (d, i) => d * 10)
    //   .attr('fill', 'blue');
  }, []);

  console.log(data, 'data');

  return (
    <div id="barchart" className="App">
      <svg ref={svgRef}></svg>
    </div>
  );
}
