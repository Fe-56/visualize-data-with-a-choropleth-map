import React, { useEffect } from 'react';
import * as d3 from 'd3';
import * as topojson from "topojson-client";

var educationDataset;

const ChoroplethMap = (props) => {
    const height = 700;
    const width = 1200;
    const padding = 60;

    useEffect(() => {
        fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
        .then(res => res.json())
        .then((result) => {
            educationDataset = result;
        })
        .then(
            fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json")
            .then(res => res.json())
            .then((result) => {
                const countyData = topojson.feature(result, result.objects.counties).features;
                const maxBachelors = d3.max(educationDataset, (item) => item.bachelorsOrHigher);
                const minBachelors = d3.min(educationDataset, (item) => item.bachelorsOrHigher);
                const colorScale = d3.scaleSequential()
                                    .interpolator(d3.interpolateBlues)
                                    .domain([minBachelors, maxBachelors]);
    
                d3.select("#holder")
                    .append("svg")
                    .attr("height", height)
                    .attr("width", width);
    
                d3.select("svg")
                    .selectAll("path")
                    .data(countyData)
                    .enter()
                    .append("path")
                    .attr("d", d3.geoPath())
                    .attr("class", "county")
                    .attr("transform", "translate(160, 30)")
                    .attr("fill", (item) => {
                        const fips = item.id;
                        const bachelorsPercentage = getBachelorsPercentage(fips)
                        return colorScale(bachelorsPercentage);
                    })
                    .attr("data-fips", (item) => {
                        return item.id;
                    })
                    .attr("data-education", (item) => {
                        const fips = item.id;
                        return getBachelorsPercentage(fips);
                    })
                    .on("mouseover", (event, item) => {
                        const fips = item.id;
                        const bachelorsPercentage = getBachelorsPercentage(fips);
                        let tooltipTextColor = colorScale(bachelorsPercentage);
                        d3.select(event.currentTarget)
                            .style("stroke", "black")
                            .style("opacity", 1);
                        const tooltip = document.getElementById("tooltip");
                        tooltip.style.visibility = "visible";
                        tooltip.style.color = tooltipTextColor;
                        tooltip.setAttribute("data-fips", d3.select(event.currentTarget).attr("data-fips"));
                        tooltip.setAttribute("data-education", d3.select(event.currentTarget).attr("data-education"));

                        const county = getCountyObject(fips).area_name;
                        const state = getCountyObject(fips).state;
                        const percentage = getBachelorsPercentage(fips);
                        tooltip.innerHTML = `${county}, ${state}<br />${percentage}%`;
                    })
                    .on("mouseout", (event, item) => {
                        document.getElementById("tooltip").style.visibility = "hidden";
                        d3.select(event.currentTarget)
                            .style("stroke", "none");
                    });

                    const legendWidth = 500;
                    const legendHeight = 100;
    
                    const legendScale = d3.scaleLinear()
                                            .domain([minBachelors/100, maxBachelors/100])
                                            .range([0, legendWidth]);
                    const legendAxis = d3.axisBottom(legendScale)
                                        .tickFormat(d3.format(".0%"));

                    const legendScaleValues = Array.from({length: 7}, (_, i) => (i + 2) / 10);

                    d3.select("#legend")
                        .append("svg")
                        .attr("id", "legend-svg")
                        .attr("height", legendHeight)
                        .attr("width", legendWidth)
                        .attr("transform", `translate(0, -${legendHeight})`);

                    d3.select("#legend-svg")
                        .append("g")
                        .call(legendAxis)
                        .attr("transform", `translate(0, ${legendHeight - 60})`)
                        .attr("color", "white");

                    d3.select("#legend-svg")
                        .selectAll("rect")
                        .data(legendScaleValues)
                        .enter()
                        .append("rect")
                        .attr("x", (item) => {
                            return legendScale(item) - 137;
                        })
                        .attr("y", legendHeight - 60 - 30)
                        .attr("width", legendWidth/legendScaleValues.length)
                        .attr("height", 30)
                        .attr("fill", (item) => {
                            console.log(item)
                            return colorScale(item * 100);
                        });
            })
        )
    }, []);

    return (
        <div id="holder"></div>
    )
}

function getBachelorsPercentage(fips){
    for (let i = 0; i < educationDataset.length; i++) {
        if (fips === educationDataset[i].fips){
            return educationDataset[i].bachelorsOrHigher;
        }
    }
}

function getCountyObject(fips){
    for (let i = 0; i < educationDataset.length; i++) {
        if (fips === educationDataset[i].fips){
            return educationDataset[i];
        }
    }
}

export default ChoroplethMap;