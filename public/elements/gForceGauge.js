/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        gForceGauge.js: 
          Renders a G-force gauge visualization
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

import { polarToCartesian } from './geometryUtils.js';
import { formatNumberWithLeadingZeros } from './numberUtils.js';

const gForceGaugeSvgElement = document.getElementById("gForceGaugeSvg");
const gForceGaugeSvg = gForceGaugeSvgElement ? d3.select("#gForceGaugeSvg") : null;

// Configuration parameters for G-force gauge visualization
const gForceGauge = {
    outerRadius: 143 / 2.5,      // Same as boostGauge
    innerRadius: 95 / 3,         // Same as boostGauge
    centerRadius: 2,             // Radius of the center circle
    indicatorRadius: 7.5,        // Radius of the moving indicator
    maxGForce: 2.0,              // Value at which the indicator reaches the edge
    outerStrokeWidth: 1,
    innerStrokeWidth: 1
};

if (gForceGaugeSvg) {
    renderGForceGauge(gForceGaugeSvg);
}

/**
 * Renders a G-force gauge visualization
 * @param {Element} svgElement - The SVG element to render into
 * @param {Object} telemetryData - Telemetry data
 * @param {Object} rpmDialPosition - Position information from the rpmDial
 */
export function renderGForceGauge(svgElement, telemetryData, rpmDialPosition) {
    if (svgElement) {
        const svg = d3.select(svgElement);

        // Get the SVG dimensions
        const svgWidth = parseInt(svg.style("width") || svg.attr("width"));
        const svgHeight = parseInt(svg.style("height") || svg.attr("height"));

        // Calculate the center point
        const centerX = svgWidth / 2;
        const centerY = svgHeight / 2;

        // Clear existing content
        svg.selectAll("*").remove();

        // If we have position information from the rpmDial, use it to position the G-force gauge
        let gForceGaugeX = centerX;
        let gForceGaugeY = centerY;

        if (rpmDialPosition) {
            // Position the G-force gauge to the right of the boost gauge
            // The boost gauge is positioned at rpmDialPosition.rightEdge
            // We'll position the G-force gauge at rpmDialPosition.rightEdge + 2*gForceGauge.outerRadius
            gForceGaugeX = rpmDialPosition.rightEdge + 2 * gForceGauge.outerRadius;
            gForceGaugeY = rpmDialPosition.topEdge + gForceGauge.outerRadius;
        }

        // Draw outer circle
        svg.append("circle")
            .attr("cx", gForceGaugeX)
            .attr("cy", gForceGaugeY)
            .attr("r", gForceGauge.outerRadius)
            .attr("fill", "none")
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", gForceGauge.outerStrokeWidth);

        // Draw inner circle
        svg.append("circle")
            .attr("cx", gForceGaugeX)
            .attr("cy", gForceGaugeY)
            .attr("r", gForceGauge.innerRadius)
            .attr("fill", "none")
            .attr("stroke", "var(--color-secondary)")
            .attr("stroke-width", gForceGauge.innerStrokeWidth);

        // Draw cardinal lines (top, bottom, left, right)
        // Top line
        svg.append("line")
            .attr("x1", gForceGaugeX)
            .attr("y1", gForceGaugeY - gForceGauge.innerRadius + 5)
            .attr("x2", gForceGaugeX)
            .attr("y2", gForceGaugeY - gForceGauge.innerRadius)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Bottom line
        svg.append("line")
            .attr("x1", gForceGaugeX)
            .attr("y1", gForceGaugeY + gForceGauge.innerRadius - 5)
            .attr("x2", gForceGaugeX)
            .attr("y2", gForceGaugeY + gForceGauge.innerRadius)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Left line
        svg.append("line")
            .attr("x1", gForceGaugeX - gForceGauge.innerRadius)
            .attr("y1", gForceGaugeY)
            .attr("x2", gForceGaugeX - gForceGauge.innerRadius + 5)
            .attr("y2", gForceGaugeY)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Right line
        svg.append("line")
            .attr("x1", gForceGaugeX + gForceGauge.innerRadius)
            .attr("y1", gForceGaugeY)
            .attr("x2", gForceGaugeX + gForceGauge.innerRadius - 5)
            .attr("y2", gForceGaugeY)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Small center circle indicator
        svg.append("circle")
            .attr("cx", gForceGaugeX)
            .attr("cy", gForceGaugeY)
            .attr("r", gForceGauge.centerRadius)
            .attr("fill", "none")
            .attr("stroke", "var(--color-primary-40)")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Default position for the indicator
        let indicatorX = gForceGaugeX;
        let indicatorY = gForceGaugeY;
        let originalDistanceFromCenter = 0;
        let angle = 0;

        // Apply telemetry data if available
        if (telemetryData) {
            // Get lateral G-force (AccelerationX) and longitudinal G-force (AccelerationZ)
            // Convert from m/s² to G (1G = 9.81 m/s²)
            const lateralG = telemetryData.AccelerationX ? telemetryData.AccelerationX / 9.81 : 0;
            const longitudinalG = telemetryData.AccelerationZ ? telemetryData.AccelerationZ / 9.81 : 0;

            // Normalize G-forces
            const normalizedLateralG = Math.min(Math.max(lateralG / gForceGauge.maxGForce, -1), 1);
            const normalizedLongitudinalG = Math.min(Math.max(longitudinalG / gForceGauge.maxGForce, -1), 1);

            // Calculate initial position
            // Lateral G-force (left/right) maps to X-axis
            // Longitudinal G-force (forward/backward) maps to Y-axis
            indicatorX = gForceGaugeX + (normalizedLateralG * gForceGauge.outerRadius);
            indicatorY = gForceGaugeY - (normalizedLongitudinalG * gForceGauge.outerRadius);

            // Apply radial limit to ensure the indicator stays within the circular boundary
            originalDistanceFromCenter = Math.sqrt(
                Math.pow(indicatorX - gForceGaugeX, 2) + 
                Math.pow(indicatorY - gForceGaugeY, 2)
            );

            // Store the original angle for rotation
            angle = Math.atan2(indicatorY - gForceGaugeY, indicatorX - gForceGaugeX);

            // If the distance exceeds the radius, normalize the position to the circle's edge
            if (originalDistanceFromCenter > gForceGauge.outerRadius) {
                indicatorX = gForceGaugeX + Math.cos(angle) * gForceGauge.outerRadius;
                indicatorY = gForceGaugeY + Math.sin(angle) * gForceGauge.outerRadius;
            }
        }

        // If we're not using telemetry data, calculate angle and distance
        if (!telemetryData) {
            // Calculate angle for rotation (to face center)
            angle = Math.atan2(indicatorY - gForceGaugeY, indicatorX - gForceGaugeX);

            // Calculate distance from center
            originalDistanceFromCenter = Math.sqrt(
                Math.pow(indicatorX - gForceGaugeX, 2) + 
                Math.pow(indicatorY - gForceGaugeY, 2)
            );
        }

        // Calculate flattening factor (0 at center, 1 at edge)
        const maxDistance = gForceGauge.outerRadius;

        // Only apply flattening when the indicator is at the edge of the circle
        let flatteningFactor = 0;
        if (originalDistanceFromCenter >= gForceGauge.outerRadius) {
            // Calculate how far beyond the edge the indicator would be
            flatteningFactor = Math.min((originalDistanceFromCenter - gForceGauge.outerRadius) / gForceGauge.outerRadius, 1);
        }

        // Calculate dimensions for the rounded rectangle
        // Square until it reaches the edge, then flattens perpendicular to direction
        const indicatorSize = gForceGauge.indicatorRadius * 2;
        const indicatorRectWidth = indicatorSize;
        // Reduce height from indicatorRadius to half indicatorRadius when fully flattened
        const indicatorRectHeight = indicatorSize * (1 - flatteningFactor * 0.5);
        const cornerRadius = gForceGauge.indicatorRadius;

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

        // Add "G" text below the gauge
        svg.append("text")
            .attr("x", gForceGaugeX)
            .attr("y", gForceGaugeY + gForceGauge.outerRadius + 15)
            .attr("text-anchor", "middle")
            .attr("class", "small-attribute-title-2")
            .attr("fill", "var(--color-primary-40)")
            .text("G-FORCE");

        // Calculate the magnitude of G-force if telemetry data is available
        if (telemetryData) {
            // Get lateral G-force (AccelerationX) and longitudinal G-force (AccelerationZ)
            // Convert from m/s² to G (1G = 9.81 m/s²)
            const lateralG = telemetryData.AccelerationX ? telemetryData.AccelerationX / 9.81 : 0;
            const longitudinalG = telemetryData.AccelerationZ ? telemetryData.AccelerationZ / 9.81 : 0;

            // Calculate the magnitude of G-force (Pythagorean theorem)
            const gForceMagnitude = Math.sqrt(lateralG * lateralG + longitudinalG * longitudinalG);

            // Extract integer and decimal parts
            const integerPart = Math.floor(gForceMagnitude);
            const decimalPart = gForceMagnitude.toFixed(1).split('.')[1];

            // Format integer part with leading zeros
            const formattedInteger = formatNumberWithLeadingZeros(integerPart, 1);

            // Create a container for the integer part
            const integerContainer = svg.append("g")
                .attr("transform", `translate(${gForceGaugeX}, ${gForceGaugeY + gForceGauge.outerRadius + 35})`);

            // Calculate total width for centering
            let totalWidth = formattedInteger.length * 8;

            // Center the text by starting at negative half of total width
            let xOffset = -totalWidth / 2;

            // Add each character with appropriate opacity
            formattedInteger.forEach(char => {
                integerContainer.append("text")
                    .attr("x", xOffset)
                    .attr("y", 0)
                    .attr("text-anchor", "middle")
                    .attr("class", "small-attribute-integer")
                    .attr("fill", "var(--color-primary)")
                    .attr("opacity", char.opacity)
                    .text(char.text);

                xOffset += 8; // Adjust spacing for monospaced font
            });

            // Add decimal part of G-force value right next to the integer part
            integerContainer.append("text")
                .attr("x", xOffset)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .attr("class", "small-attribute-decimal")
                .attr("fill", "var(--color-primary)")
                .text(`.${decimalPart}`);
        }
    }
}
