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

const gForceGauge = {
    outerRadius: 143 / 2.5,
    innerRadius: 95 / 3,
    centerRadius: 2,             // Radius of the center circle
    indicatorRadius: 7.5,        // Radius of the moving indicator
    maxGForce: 2.0,              // Value at which the indicator reaches the edge
    outerStrokeWidth: 1,
    innerStrokeWidth: 1
};

const rpmDialOuterRadius = 143;

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

        const svgWidth = parseInt(svg.style("width") || svg.attr("width"));
        const svgHeight = parseInt(svg.style("height") || svg.attr("height"));

        const centerX = svgWidth / 2;
        const centerY = svgHeight / 2;

        // Clear existing content
        svg.selectAll("*").remove();

        let gForceGaugeX = centerX;
        let gForceGaugeY = centerY;

        if (rpmDialPosition) {
            const rpmDialCenterX = rpmDialPosition.rightEdge - rpmDialOuterRadius;
            const rpmDialLeftEdge = rpmDialCenterX - rpmDialOuterRadius;
            gForceGaugeX = rpmDialLeftEdge - 2 * gForceGauge.outerRadius;
            gForceGaugeY = rpmDialPosition.topEdge + gForceGauge.outerRadius;
        } else {
            gForceGaugeX = centerX - rpmDialOuterRadius - 2 * gForceGauge.outerRadius;
            gForceGaugeY = centerY;
        }

        // Outer circle
        svg.append("circle")
            .attr("cx", gForceGaugeX)
            .attr("cy", gForceGaugeY)
            .attr("r", gForceGauge.outerRadius)
            .attr("fill", "none")
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", gForceGauge.outerStrokeWidth);

        // Inner circle
        svg.append("circle")
            .attr("cx", gForceGaugeX)
            .attr("cy", gForceGaugeY)
            .attr("r", gForceGauge.innerRadius)
            .attr("fill", "none")
            .attr("stroke", "var(--color-secondary)")
            .attr("stroke-width", gForceGauge.innerStrokeWidth);

        // Draw cardinal lines
        // Top
        svg.append("line")
            .attr("x1", gForceGaugeX)
            .attr("y1", gForceGaugeY - gForceGauge.innerRadius + 5)
            .attr("x2", gForceGaugeX)
            .attr("y2", gForceGaugeY - gForceGauge.innerRadius)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Bottom
        svg.append("line")
            .attr("x1", gForceGaugeX)
            .attr("y1", gForceGaugeY + gForceGauge.innerRadius - 5)
            .attr("x2", gForceGaugeX)
            .attr("y2", gForceGaugeY + gForceGauge.innerRadius)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Left
        svg.append("line")
            .attr("x1", gForceGaugeX - gForceGauge.innerRadius)
            .attr("y1", gForceGaugeY)
            .attr("x2", gForceGaugeX - gForceGauge.innerRadius + 5)
            .attr("y2", gForceGaugeY)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Right
        svg.append("line")
            .attr("x1", gForceGaugeX + gForceGauge.innerRadius)
            .attr("y1", gForceGaugeY)
            .attr("x2", gForceGaugeX + gForceGauge.innerRadius - 5)
            .attr("y2", gForceGaugeY)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Center indicator
        svg.append("circle")
            .attr("cx", gForceGaugeX)
            .attr("cy", gForceGaugeY)
            .attr("r", gForceGauge.centerRadius)
            .attr("fill", "none")
            .attr("stroke", "var(--color-primary-40)")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        let indicatorX = gForceGaugeX;
        let indicatorY = gForceGaugeY;
        let originalDistanceFromCenter = 0;
        let angle = 0;

        if (telemetryData) {
            // wack
            const lateralG = telemetryData.AccelerationX ? -telemetryData.AccelerationX / 9.81 * 0.9: 0;
            const longitudinalG = telemetryData.AccelerationZ ? -telemetryData.AccelerationZ / 9.81 * 0.9: 0;

            // Normalize
            const normalizedLateralG = Math.min(Math.max(lateralG / gForceGauge.maxGForce, -1), 1);
            const normalizedLongitudinalG = Math.min(Math.max(longitudinalG / gForceGauge.maxGForce, -1), 1);

            indicatorX = gForceGaugeX + (normalizedLateralG * gForceGauge.outerRadius);
            indicatorY = gForceGaugeY - (normalizedLongitudinalG * gForceGauge.outerRadius);

            // Radial limit
            originalDistanceFromCenter = Math.sqrt(
                Math.pow(indicatorX - gForceGaugeX, 2) + 
                Math.pow(indicatorY - gForceGaugeY, 2)
            );

            angle = Math.atan2(indicatorY - gForceGaugeY, indicatorX - gForceGaugeX);

            // Normalise
            if (originalDistanceFromCenter > gForceGauge.outerRadius) {
                indicatorX = gForceGaugeX + Math.cos(angle) * gForceGauge.outerRadius;
                indicatorY = gForceGaugeY + Math.sin(angle) * gForceGauge.outerRadius;
            }
        }

        if (!telemetryData) {
            angle = Math.atan2(indicatorY - gForceGaugeY, indicatorX - gForceGaugeX);

            originalDistanceFromCenter = Math.sqrt(
                Math.pow(indicatorX - gForceGaugeX, 2) + 
                Math.pow(indicatorY - gForceGaugeY, 2)
            );
        }

        // Flattening factor
        const maxDistance = gForceGauge.outerRadius;

        let flatteningFactor = 0;
        if (originalDistanceFromCenter >= gForceGauge.outerRadius) {
            // Calculate how far beyond the edge the indicator would be
            flatteningFactor = Math.min((originalDistanceFromCenter - gForceGauge.outerRadius) / gForceGauge.outerRadius, 1);
        }

        // flattening square
        const indicatorSize = gForceGauge.indicatorRadius * 2;
        const indicatorRectWidth = indicatorSize;
        const indicatorRectHeight = indicatorSize * (1 - flatteningFactor * 0.5);
        const cornerRadius = gForceGauge.indicatorRadius;

        // Moving grip indicator
        svg.append("rect")
            .attr("x", indicatorX - indicatorRectWidth / 2)
            .attr("y", indicatorY - indicatorRectHeight / 2)
            .attr("width", indicatorRectWidth)
            .attr("height", indicatorRectHeight)
            .attr("rx", cornerRadius)
            .attr("ry", cornerRadius)
            .attr("fill", "var(--color-primary)")
            .attr("transform", `rotate(${angle * (180/Math.PI) + 90}, ${indicatorX}, ${indicatorY})`);

        // Add "G" below gauge
        svg.append("text")
            .attr("x", gForceGaugeX)
            .attr("y", gForceGaugeY + gForceGauge.outerRadius + 15)
            .attr("text-anchor", "middle")
            .attr("class", "small-attribute-title-2")
            .attr("fill", "var(--color-primary-40)")
            .text("G-FORCE");

        const lateralG = (telemetryData && telemetryData.AccelerationX !== undefined) 
            ? telemetryData.AccelerationX / 9.81 * 0.9
            : 0;
        const longitudinalG = (telemetryData && telemetryData.AccelerationZ !== undefined) 
            ? telemetryData.AccelerationZ / 9.81 * 0.9
            : 0;

        const isDefaultGForce = !(telemetryData && (telemetryData.AccelerationX !== undefined || telemetryData.AccelerationZ !== undefined));

        const gForceMagnitude = Math.sqrt(lateralG * lateralG + longitudinalG * longitudinalG);
        // Extract integer and decimal parts
        const integerPart = Math.floor(gForceMagnitude);
        const decimalPart = gForceMagnitude.toFixed(1).split('.')[1];

        // Format with leading zeros
        const formattedInteger = formatNumberWithLeadingZeros(integerPart, 1);

        const integerContainer = svg.append("g")
            .attr("transform", `translate(${gForceGaugeX}, ${gForceGaugeY + gForceGauge.outerRadius + 35})`);

        let totalWidth = formattedInteger.length * 8;
        let xOffset = -totalWidth / 2;

        // Character
        formattedInteger.forEach(char => {
            integerContainer.append("text")
                .attr("x", xOffset)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .attr("class", "small-attribute-integer")
                .attr("fill", "var(--color-primary)")
                .attr("opacity", isDefaultGForce ? 0.5 : char.opacity)
                .text(char.text);

            xOffset += 8;
        });

        // Decimal part
        integerContainer.append("text")
            .attr("x", xOffset)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("class", "small-attribute-decimal")
            .attr("fill", "var(--color-primary)")
            .attr("opacity", isDefaultGForce ? 0.5 : 1)
            .text(`.${decimalPart}`);
    }
}
