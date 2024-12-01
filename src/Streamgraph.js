import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const colors = {
  "GPT-4": "#e41a1c",
  Gemini: "#377eb8",
  "PaLM-2": "#4daf4a",
  Claude: "#984ea3",
  "LLaMA-3.1": "#ff7f00",
};

function Streamgraph({ data }) {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 150, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => new Date(d.Date)))
      .range([0, width]);

    const y = d3.scaleLinear().range([height, 0]);

    const stack = d3
      .stack()
      .keys(Object.keys(colors))
      .offset(d3.stackOffsetWiggle);

    const stackedData = stack(data);

    y.domain([
      d3.min(stackedData, (layer) => d3.min(layer, (d) => d[0])),
      d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1])),
    ]);

    const area = d3
      .area()
      .x((d) => x(new Date(d.data.Date)))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]));

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.selectAll(".layer")
      .data(stackedData)
      .enter()
      .append("path")
      .attr("class", "layer")
      .attr("d", area)
      .style("fill", (d) => colors[d.key])
      .on("mousemove", function (event, d) {
        const hoveredData = data.map((point) => ({
          Date: point.Date,
          Value: point[d.key],
        }));

        const tooltip = d3.select(tooltipRef.current);
        tooltip
          .style("display", "block")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 5}px`);

        renderMiniBarChart(hoveredData, d.key);
      })
      .on("mouseout", () => {
        d3.select(tooltipRef.current).style("display", "none");
      });

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g").call(d3.axisLeft(y));

    const legend = svg.append("g").attr("transform", `translate(${width + 100}, 20)`);
    
    stackedData.forEach((layer, i) => {
      legend
        .append("rect")
        .attr("x", 0)
        .attr("y", i * 20)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", colors[layer.key]);
  
      legend
        .append("text")
        .attr("x", 20)
        .attr("y", i * 20 + 12)
        .text(layer.key)
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
    });


    const renderMiniBarChart = (hoveredData, key) => {
      const miniWidth = 200;
      const miniHeight = 150;

      const miniMargin = { top: 10, right: 10, bottom: 40, left: 40 };
      const innerWidth = miniWidth - miniMargin.left - miniMargin.right;
      const innerHeight = miniHeight - miniMargin.top - miniMargin.bottom;

      const miniX = d3
        .scaleBand()
        .domain(hoveredData.map((d) => d.Date))
        .range([0, innerWidth])
        .padding(0.1);

      const miniY = d3
        .scaleLinear()
        .domain([0, d3.max(hoveredData, (d) => d.Value)])
        .range([innerHeight, 0]);

      const tooltipSvg = d3.select("#tooltip-svg");
      tooltipSvg.selectAll("*").remove();

      const miniG = tooltipSvg
        .attr("width", miniWidth)
        .attr("height", miniHeight)
        .append("g")
        .attr(
          "transform",
          `translate(${miniMargin.left},${miniMargin.top})`
        );

      miniG
        .selectAll(".bar")
        .data(hoveredData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => miniX(d.Date))
        .attr("y", (d) => miniY(d.Value))
        .attr("width", miniX.bandwidth())
        .attr("height", (d) => innerHeight - miniY(d.Value))
        .attr("fill", colors[key]);

        const monthFormat = d3.timeFormat("%b");

      miniG
          .append("g")
          .attr("transform", `translate(0,${innerHeight})`)
          .call(
            d3
              .axisBottom(miniX)
              .tickFormat((d, i) => ( monthFormat(new Date(d))))
          )
          .selectAll("text")
          .style("text-anchor", "end")
          .attr("transform", "rotate(-45)");
      
        miniG.append("g").call(d3.axisLeft(miniY).ticks(4));
      
      miniG
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + miniMargin.bottom - 5)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Month");
  
    miniG
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -miniMargin.left + 10)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Value");
    };
  }, [data]);

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef}></svg>
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          display: "none",
          background: "white",
          border: "1px solid #ccc",
          padding: "10px",
          
        }}
      >
        <svg id="tooltip-svg"></svg>
      </div>
    </div>
  );
}

export default Streamgraph;