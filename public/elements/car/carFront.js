/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        carFront.js: 
          Renders the front horizontal view of the car with
          transform based on telemetry data
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

import { CAR_SVG_SCALE } from './carConfig.js';
import { getCachedSvg, preloadCarSvgs } from './carSvgCache.js';

const carFrontSvgElement = document.getElementById("carFrontSvg");
const carFrontSvg = carFrontSvgElement ? d3.select("#carFrontSvg") : null;

/**
 * Renders the front view of the car
 * @param {Element} svgElement - The SVG element to render into
 * @param {Object} telemetryData - Telemetry data for transformations
 */
export function rendercarFront(svgElement, telemetryData) {
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
            const scale = (baseScale * CAR_SVG_SCALE) * 0.7;

            // Calculate position to center the SVG
            const translateX = (svgWidth - (originalWidth * scale)) / 2;
            const translateY = (svgHeight - (originalHeight * scale)) / 2;

            // Default transformations
            let rotationAngle = 0;

            // Apply telemetry data
            if (telemetryData) {
                // Rotate based on angular acceleration on Z axis (roll)
                if (telemetryData.AngularVelocityZ !== undefined) {
                    // Scale the rotation
                    rotationAngle = telemetryData.AngularVelocityZ * 5;
                }
            }

            // Create a group element to apply transformations
            // Apply rotation around the center of the SVG
            const g = svg.append("g")
                .attr("transform", `translate(${translateX}, ${translateY}) scale(${scale}) rotate(${rotationAngle}, ${originalWidth/2}, ${originalHeight/2})`);

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
        };

        // Get cached SVG / load it if not cached
        const cachedSvg = getCachedSvg('front');
        if (cachedSvg) {
            // Clear existing content
            svg.selectAll("*").remove();
            renderWithData(cachedSvg);
        } else {
            // If not cached yet, load it (should only happen once)
            d3.xml("/elements/car/carFront.svg").then(data => {
                // Clear existing content
                svg.selectAll("*").remove();
                renderWithData(data);
            }).catch(error => {
                console.error("Error loading carFront.svg:", error);

                // display a placeholder rectangle if SVG fails to load
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
                    .text("Front View");
            });
        }
    }
}
