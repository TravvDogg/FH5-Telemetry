/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        carSide.js: 
          Renders the side horizontal view of the car with
          transform based on telemetry data
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

import { CAR_SVG_SCALE } from './carConfig.js';
import { getCachedSvg, preloadCarSvgs } from './carSvgCache.js';

const carSideSvgElement = document.getElementById("carSideSvg");
const carSideSvg = carSideSvgElement ? d3.select("#carSideSvg") : null;

/**
 * Renders the side view of the car
 * @param {Element} svgElement - The SVG element to render into
 * @param {Object} telemetryData -Telemetry data for transformations
 */
export function rendercarSide(svgElement, telemetryData) {
    if (svgElement) {
        const svg = d3.select(svgElement);

        // Get the SVG dimensions
        const svgWidth = parseInt(svg.style("width") || svg.attr("width"));
        const svgHeight = parseInt(svg.style("height") || svg.attr("height"));

        // Get the cached SVG data or wait for it to load
        const renderWithData = (data) => {
            // Extract the SVG element from the loaded file
            const svgNode = data.documentElement;

            // Get the original viewBox to maintain aspect ratio
            const viewBox = svgNode.getAttribute("viewBox");
            const [, , originalWidth, originalHeight] = viewBox.split(" ").map(Number);

            // Calculate scaling factor to fit the container while maintaining aspect ratio
            const baseScale = Math.min(svgWidth / originalWidth, svgHeight / originalHeight);
            // Apply global scale factor
            const scale = (baseScale * CAR_SVG_SCALE) * 1;

            // Calculate position to center the SVG
            const translateX = (svgWidth - (originalWidth * scale)) / 2;
            const translateY = (svgHeight - (originalHeight * scale)) / 2;

            // Default transformations
            let moveX = 0;
            let rotationAngle = 0;

            // Apply telemetry data if available
            if (telemetryData) {
                // Move forward/back based on Acceleration
                if (telemetryData.AccelerationZ !== undefined) {
                    // Scale the movement
                    moveX = telemetryData.AccelerationZ * 2;
                }

                // Rotate based on angular acceleration
                if (telemetryData.AngularVelocityX !== undefined) {
                    // Scale the rotation
                    rotationAngle = -telemetryData.AngularVelocityX * 5;
                }
            }

            // Create a group element to apply transformations
            // Apply rotation around the center of the SVG
            const centerX = translateX + (originalWidth * scale) / 2;
            const centerY = translateY + (originalHeight * scale) / 2;

            const g = svg.append("g")
                .attr("transform", `translate(${translateX + moveX}, ${translateY}) scale(${scale}) rotate(${rotationAngle}, ${originalWidth/2}, ${originalHeight/2})`);

            // Append all child nodes from the loaded SVG
            Array.from(svgNode.childNodes).forEach(childNode => {
                if (childNode.nodeType === 1) { // Element node
                    // Fix for SVG elements with stroke but no fill (defaults to black)
                    if (childNode.hasAttribute('stroke') && !childNode.hasAttribute('fill')) {
                        childNode.setAttribute('fill', 'none');
                    }

                    // Also check child elements
                    Array.from(childNode.querySelectorAll('*')).forEach(child => {
                        if (child.hasAttribute('stroke') && !child.hasAttribute('fill')) {
                            child.setAttribute('fill', 'none');
                        }
                    });

                    g.node().appendChild(childNode.cloneNode(true));
                }
            });

            // Add a horizontal line under the car (ground line) - added after SVG to ensure it's on top
            svg.append("line")
                .attr("x1", 0)
                .attr("y1", svgHeight * 0.78)
                .attr("x2", svgWidth)
                .attr("y2", svgHeight * 0.78)
                .attr("stroke", "#555")
                .attr("stroke-width", 2);
        };

        // Get cached SVG or load it if not cached
        const cachedSvg = getCachedSvg('side');
        if (cachedSvg) {
            // Clear existing content only right before redrawing
            svg.selectAll("*").remove();
            renderWithData(cachedSvg);
        } else {
            // If not cached yet, load it (should only happen once)
            d3.xml("/elements/car/carSide.svg").then(data => {
                // Clear existing content only right before redrawing
                svg.selectAll("*").remove();
                renderWithData(data);
            }).catch(error => {
                console.error("Error loading carSide.svg:", error);

                // Display a placeholder rectangle if SVG fails to load
                svg.selectAll("*").remove();
                svg.append("rect")
                    .attr("x", svgWidth * 0.1)
                    .attr("y", svgHeight * 0.1)
                    .attr("width", svgWidth * 0.8)
                    .attr("height", svgHeight * 0.8)
                    .attr("fill", "none")
                    .attr("stroke", "#ccc")
                    .attr("stroke-width", 2);

                svg.append("text")
                    .attr("x", svgWidth / 2)
                    .attr("y", svgHeight / 2)
                    .attr("text-anchor", "middle")
                    .attr("fill", "#ccc")
                    .text("Side View");
            });
        }
    }
}
