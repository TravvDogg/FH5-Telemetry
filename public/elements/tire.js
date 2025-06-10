/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        tire.js: 
          Renders the tire visualization to display telemetry data
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

import { createFormattedNumberDisplay } from './numberUtils.js';

const tireSvgElement = document.getElementById("tireSvg");
const tireSvg = tireSvgElement ? d3.select("#tireSvg") : null;

// Configuration parameters for tire visualization
const tire = {
    outerRadius: 30,      // Radius of the main circle
    innerLineLength: 6,   // Length of the cardinal lines
    centerRadius: 2,      // Radius of the center circle
    indicatorRadius: 7.5, // Radius of the moving indicator
    maxSlipRatio: 2.25,    // Value at which the indicator reaches the edge
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
        // Get the parent container of the SVG element
        const parentContainer = svgElement.parentElement;
        if (!parentContainer) return;

        // Get the parent of the parent container (flex-container)
        const flexContainer = parentContainer.parentElement;
        if (!flexContainer) return;

        // Find the header container (right side of the flex container)
        const headerContainer = flexContainer.querySelector('.header-container');
        if (!headerContainer) return;

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
            .attr("stroke", "var(--color-primary)")
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
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", 2);

        // Cardinal Lines (top, bottom, left, right)
        // Top line
        svg.append("line")
            .attr("x1", centerX)
            .attr("y1", centerY - dynamicOuterRadius)
            .attr("x2", centerX)
            .attr("y2", centerY - dynamicOuterRadius + tire.innerLineLength)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Bottom line
        svg.append("line")
            .attr("x1", centerX)
            .attr("y1", centerY + dynamicOuterRadius)
            .attr("x2", centerX)
            .attr("y2", centerY + dynamicOuterRadius - tire.innerLineLength)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Left line
        svg.append("line")
            .attr("x1", centerX - dynamicOuterRadius)
            .attr("y1", centerY)
            .attr("x2", centerX - dynamicOuterRadius + tire.innerLineLength)
            .attr("y2", centerY)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Right line
        svg.append("line")
            .attr("x1", centerX + dynamicOuterRadius)
            .attr("y1", centerY)
            .attr("x2", centerX + dynamicOuterRadius - tire.innerLineLength)
            .attr("y2", centerY)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Small center circle indicator
        svg.append("circle")
            .attr("cx", centerX)
            .attr("cy", centerY)
            .attr("r", tire.centerRadius)
            .attr("fill", "none")
            .attr("stroke", "var(--color-primary-40)")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Default position for the indicator
        let indicatorX = centerX;
        let indicatorY = centerY;
        let originalDistanceFromCenter = 0;
        let angle = 0;

        // Extract tire position from SVG ID to determine which telemetry data to use
        let tirePosition = svgElement.id.split('-').pop();
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
            const normalizedSlipAngle = Math.min(Math.max(slipAngle / tire.maxSlipRatio, -1.5), 1.5);
            const normalizedSlipRatio = Math.min(Math.max(slipRatio / tire.maxSlipRatio, -1.5), 1.5);

            // Calculate initial position
            indicatorX = centerX + (normalizedSlipAngle * dynamicOuterRadius);
            indicatorY = centerY + (normalizedSlipRatio * dynamicOuterRadius);

            // Apply radial limit to ensure the indicator stays within the tire's circular boundary
            originalDistanceFromCenter = Math.sqrt(
                Math.pow(indicatorX - centerX, 2) + 
                Math.pow(indicatorY - centerY, 2)
            );

            // Store the original angle for rotation
            angle = Math.atan2(indicatorY - centerY, indicatorX - centerX);

            // If the distance exceeds the radius, normalize the position to the circle's edge
            if (originalDistanceFromCenter > dynamicOuterRadius) {
                indicatorX = centerX + Math.cos(angle) * dynamicOuterRadius;
                indicatorY = centerY + Math.sin(angle) * dynamicOuterRadius;
            }
        }

        // If we're not using telemetry data, calculate angle and distance
        if (!telemetryData) {
            // Calculate angle for rotation (to face center)
            angle = Math.atan2(indicatorY - centerY, indicatorX - centerX);

            // Calculate distance from center
            originalDistanceFromCenter = Math.sqrt(
                Math.pow(indicatorX - centerX, 2) + 
                Math.pow(indicatorY - centerY, 2)
            );
        }

        // Calculate flattening factor (0 at center, 1 at 2x maxSlipRatio)
        const maxDistance = dynamicOuterRadius * 2; // 2x maxSlipRatio

        // Only apply flattening when the indicator is at the edge of the circle
        let flatteningFactor = 0;
        if (originalDistanceFromCenter >= dynamicOuterRadius) {
            // Calculate how far beyond the edge the indicator would be
            flatteningFactor = Math.min((originalDistanceFromCenter - dynamicOuterRadius) / dynamicOuterRadius, 1);
        }

        // Calculate dimensions for the rounded rectangle
        // Square until it reaches the edge, then flattens perpendicular to direction
        const indicatorSize = tire.indicatorRadius * 2;
        const indicatorRectWidth = indicatorSize;
        // Reduce height from indicatorRadius to half indicatorRadius when fully flattened
        const indicatorRectHeight = indicatorSize * (1 - flatteningFactor * 0.5);
        const cornerRadius = tire.indicatorRadius;

        // Create the moving indicator as a rounded rectangle that rotates to face center
        svg.append("rect")
            .attr("x", indicatorX - indicatorRectWidth / 2)
            .attr("y", indicatorY - indicatorRectHeight / 2)
            .attr("width", indicatorRectWidth)
            .attr("height", indicatorRectHeight)
            .attr("rx", cornerRadius)
            .attr("ry", cornerRadius)
            .attr("fill", "var(--color-primary)")
            .attr("transform", `rotate(${angle * (180/Math.PI) + 90}, ${indicatorX}, ${indicatorY})`);

        // Extract tire position from SVG ID to determine which telemetry data to use for speed and temperature
        tirePosition = svgElement.id.split('-').pop();

        // Clear existing speed and temperature displays
        const existingSpeedContainer = headerContainer.querySelector('.speed-container');
        if (existingSpeedContainer) {
            existingSpeedContainer.remove();
        }

        const existingTempContainer = headerContainer.querySelector('.temp-container');
        if (existingTempContainer) {
            existingTempContainer.remove();
        }

        // Create containers for speed and temperature displays
        const speedContainer = document.createElement('div');
        speedContainer.className = 'speed-container';
        headerContainer.appendChild(speedContainer);

        const tempContainer = document.createElement('div');
        tempContainer.className = 'temp-container';
        headerContainer.appendChild(tempContainer);

        // Add titles with explicit styling to ensure visibility
        const speedTitle = document.createElement('div');
        speedTitle.className = 'large-attribute-title';
        speedTitle.textContent = 'SPEED';
        speedTitle.style.color = 'var(--color-primary)';
        speedTitle.style.opacity = '1';
        speedTitle.style.fontSize = '24px';
        speedTitle.style.fontFamily = "'Lekton', monospace";
        speedContainer.appendChild(speedTitle);

        const tempTitle = document.createElement('div');
        tempTitle.className = 'large-attribute-title';
        tempTitle.textContent = 'TEMP';
        tempTitle.style.color = 'var(--color-primary)';
        tempTitle.style.opacity = '1';
        tempTitle.style.fontSize = '24px';
        tempTitle.style.fontFamily = "'Lekton', monospace";
        tempContainer.appendChild(tempTitle);

        // Default values
        let speed = 0;
        let temperature = 0;

        // Apply telemetry data if available
        if (telemetryData) {
            // Determine which tire's data to use based on the SVG element's ID
            if (tirePosition === '0') { // Front Left
                speed = telemetryData.Speed || 0;
                temperature = telemetryData.TireTempFl || 0;
            } else if (tirePosition === '1') { // Front Right
                speed = telemetryData.Speed || 0;
                temperature = telemetryData.TireTempFr || 0;
            } else if (tirePosition === '2') { // Rear Left
                speed = telemetryData.Speed || 0;
                temperature = telemetryData.TireTempRl || 0;
            } else if (tirePosition === '3') { // Rear Right
                speed = telemetryData.Speed || 0;
                temperature = telemetryData.TireTempRr || 0;
            }
        }

        // Convert speed to km/h if needed (assuming it's in m/s)
        const speedKmh = speed * 3.6;

        // Create formatted displays for speed and temperature
        createFormattedNumberDisplay(speedContainer, speedKmh, 3, 1, 'KM/H');
        createFormattedNumberDisplay(tempContainer, temperature, 3, 1, '°C');
    }
}
