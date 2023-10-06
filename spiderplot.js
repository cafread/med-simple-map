// Charts up a single spiderweb plot
function singleSpider (id, dat, options = {}) {
    let config = {
        width: 200,
        height: 200,
        levels: 2,
        opacityArea: 0.8,
        color: "#455C91"
    };
    // Apply passed config as overrides
    Object.keys(config)
          .filter(k => options.hasOwnProperty(k))
          .forEach(k => config[k] = options[k]);
    let axNames = Object.keys(dat);
    let axsCount = axNames.length;
    let g = d3.select(id)
            .attr("width",  config.width)
            .attr("height", config.height)
            .append("g")
                .attr("transform", "translate(" + (config.width / 2) + "," + (config.height / 2) + ")");
    let radius = 0.8 * Math.min(config.width, config.height) / 2 - 15; // 0.8 leaves space for labels
    function genPoint (frac, i) { // frac of radius as a distance, i as axis number
        // Return the x, y coordinates for the target point
        let rot = 2 * Math.PI * i / axsCount;
        return [
            frac * radius * Math.sin(rot),
           -frac * radius * Math.cos(rot) // Negative to place first stright up
        ];
    }
    let axisEnds = axNames.map((v, i) => genPoint(1, i));
    // Draw each axis from 0, 0 to the end
    g.selectAll(".spiderAxis")
         .data(axisEnds)
         .join('line')
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", d => d[0])
            .attr("y2", d => d[1])
            .attr("class", "spiderAxis")
            .style("stroke", "grey")
            .style("stroke-width", "1.3px");
    let webLines = Array.from({length: config.levels}).map((d, i) => {
        // Generate polygon points to draw web, one polygon for each level
        // i represents the polygon number, zero indexed, so add one to get the relevant position
        let frac = (i + 1) / config.levels;
        return axNames.map((v, j) => genPoint(frac, j));
    });
    // Draw webLines
    g.selectAll(".webLine")
        .data(webLines)
        .join("polygon")
            .attr("class", "webLine")
            .style("stroke-width", "0.5px")
            .style("stroke-opacity", 0.75)
            .style("stroke", "steelblue")
            .style("fill", "none")
            .attr("points", d => d.map(p => p.join(",")).join(" "));
    // As this deals with only one layer, the data polygon data gen is quite simple
    let maxValue = options.maxValue ?? Math.max.apply(null, Object.values(dat));
    let dataPoly = axNames.map((k, i) => genPoint(dat[k] / maxValue, i));
    g.selectAll(".spiderArea")
        .data([1])
        .join("polygon")
            .attr("class", "spiderArea")
            .style("stroke-width", "2.5px")
            .style("stroke", "black")
            .style("stroke-opacity", 0.75)
            .attr("points", d => dataPoly.map(p => p.join(",")).join(" "))
            .style("fill", d => config.color)
            .style("fill-opacity", config.opacityArea);
    // Add marker circles
    g.selectAll(".abn")
        .data(dataPoly)
        .join("circle")
            .attr("cx", d => d[0])
            .attr("cy", d => d[1])
            .style("fill", d => config.color)
            .attr("r", radius / 20);
    // Label each axis
    let labelData = axNames.map((v, i) => genPoint(1.1, i));
    function genAnchor (i) {
        let x = Math.sin(2 * Math.PI * i / axsCount);
        if (Math.abs(x) < 0.6) return "middle";
        if (x > 0) return "start";
        return "end";
    }
    labelData.forEach((d, i) => console.log(i, genAnchor(i)));
    g.selectAll('.axisLabel')
        .data(labelData)
        .join("text")
            .attr("class", "axisLabel")
            .attr("x", d => d[0])
            .attr("y", d => d[1])
            .attr("dy", "0.35em")
            .text((d, i) => axNames[i])
            .style("font-family", "sans-serif")
            .style("font-size", radius / 20)
            .attr("text-anchor", (d, i) => genAnchor(i))
            .attr("fill", "#737373");
}
// Example to show use
//const data = {"TCO": 80, "PNR": 40, "LCA": 40, "RAR": 90, "ABC": 60, "XYZ": 80};
//const optn = {"width": 300, "height": 300, "color": "#226666", "maxValue": 100};
//singleSpider("#spiderSVG", data, optn); // spiderSVG being an extant SVG