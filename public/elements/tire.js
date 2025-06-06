/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        tire.js: 
          Renders the tire visualization to display telemetry data
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

const tireSvgElement = document.getElementById("tireSvg");
const tireSvg = tireSvgElement ? d3.select("#tireSvg") : null;

// Configuration parameters for tire visualization
const tire = {
    outerRadius: 30,      // Radius of the main circle
    innerLineLength: 6,   // Length of the cardinal lines
    centerRadius: 2,      // Radius of the center circle
    indicatorRadius: 7.5, // Radius of the moving indicator
    maxSlipRatio: 3.0,    // Value at which the indicator reaches the edge
    cornerRadius: 16      // Radius of the rectangle corners
};

if (tireSvg) {
    renderTire(tireSvg);
}

/**
 * Renders a tire visualization with slip angle and slip ratio indicators
 * @param {Element} svgElement - The SVG element to render into
 * @param {Object} telemetryData - Telemetry data
 */
export function renderTire(svgElement, telemetryData) {
    if (svgElement) {
        const svg = d3.select(svgElement);

        // Get the SVG dimensions
        const svgWidth = parseInt(svg.style("width") || svg.attr("width"));
        const svgHeight = parseInt(svg.style("height") || svg.attr("height"));

        // Calculate tire dimensions based on container size
        const tireHeight = svgHeight - 16;
        const tireWidth = tireHeight * 0.6;

        const dynamicOuterRadius = tireWidth * 0.7 / 2;

        // Calculate the center point
        const centerX = svgWidth / 2;
        const centerY = svgHeight / 2;

        // Clear existing content
        svg.selectAll("*").remove();

        // Large inner circle
        svg.append("circle")
            .attr("cx", centerX)
            .attr("cy", centerY)
            .attr("r", dynamicOuterRadius)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("stroke-opacity", 0.6);

        // Tire
        const rectWidth = tireWidth;
        const rectHeight = tireHeight;
        svg.append("rect")
            .attr("x", (svgWidth - rectWidth) / 2)
            .attr("y", (svgHeight - rectHeight) / 2)
            .attr("width", rectWidth)
            .attr("height", rectHeight)
            .attr("rx", tire.cornerRadius)
            .attr("ry", tire.cornerRadius)
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("stroke-width", 2);

        // Cardinal Lines (top, bottom, left, right)
        // Top line
        svg.append("line")
            .attr("x1", centerX)
            .attr("y1", centerY - dynamicOuterRadius)
            .attr("x2", centerX)
            .attr("y2", centerY - dynamicOuterRadius + tire.innerLineLength)
            .attr("stroke", "white")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Bottom line
        svg.append("line")
            .attr("x1", centerX)
            .attr("y1", centerY + dynamicOuterRadius)
            .attr("x2", centerX)
            .attr("y2", centerY + dynamicOuterRadius - tire.innerLineLength)
            .attr("stroke", "white")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Left line
        svg.append("line")
            .attr("x1", centerX - dynamicOuterRadius)
            .attr("y1", centerY)
            .attr("x2", centerX - dynamicOuterRadius + tire.innerLineLength)
            .attr("y2", centerY)
            .attr("stroke", "white")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Right line
        svg.append("line")
            .attr("x1", centerX + dynamicOuterRadius)
            .attr("y1", centerY)
            .attr("x2", centerX + dynamicOuterRadius - tire.innerLineLength)
            .attr("y2", centerY)
            .attr("stroke", "white")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Small center circle indicator
        svg.append("circle")
            .attr("cx", centerX)
            .attr("cy", centerY)
            .attr("r", tire.centerRadius)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Default position for the indicator
        let indicatorX = centerX;
        let indicatorY = centerY;

        // Extract tire position from SVG ID to determine which telemetry data to use
        const tirePosition = svgElement.id.split('-').pop();
        let slipAngle = 0;
        let slipRatio = 0;

        // Apply telemetry data
        if (telemetryData) {
            // Determine which tire's data to use based on the SVG element's ID
            if (tirePosition === '0') { // Front Left
                slipAngle = telemetryData.TireSlipAngleFl || 0;
                slipRatio = telemetryData.TireSlipRatioFl || 0;
            } else if (tirePosition === '1') { // Front Right
                slipAngle = telemetryData.TireSlipAngleFr || 0;
                slipRatio = telemetryData.TireSlipRatioFr || 0;
            } else if (tirePosition === '2') { // Rear Left
                slipAngle = telemetryData.TireSlipAngleRl || 0;
                slipRatio = telemetryData.TireSlipRatioRl || 0;
            } else if (tirePosition === '3') { // Rear Right
                slipAngle = telemetryData.TireSlipAngleRr || 0;
                slipRatio = telemetryData.TireSlipRatioRr || 0;
            }

            // Normalize slip angle and slip ratio
            const normalizedSlipAngle = Math.min(Math.max(slipAngle / tire.maxSlipRatio, -1), 1);
            const normalizedSlipRatio = Math.min(Math.max(slipRatio / tire.maxSlipRatio, -1), 1);

            // Calculate position
            indicatorX = centerX + (normalizedSlipAngle * dynamicOuterRadius);
            indicatorY = centerY + (normalizedSlipRatio * dynamicOuterRadius);
        }

        // Create the moving indicator circle
        svg.append("circle")
            .attr("cx", indicatorX)
            .attr("cy", indicatorY)
            .attr("r", tire.indicatorRadius)
            .attr("fill", "white")
            .attr("fill-opacity", 0.6);
    }
}
