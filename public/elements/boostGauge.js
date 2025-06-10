/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        boostGauge.js: 
          Renders a boost gauge visualization
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

import { formatNumberWithLeadingZeros } from './numberUtils.js';
import { RadialNumbers } from './radialNumbers.js';
import { polarToCartesian } from './geometryUtils.js';

const boostGaugeSvgElement = document.getElementById("boostGaugeSvg");
const boostGaugeSvg = boostGaugeSvgElement ? d3.select("#boostGaugeSvg") : null;

// Configuration parameters for boost gauge visualization
const arcSpaceDegrees = 90;
const arcStartDegrees = (-180 + (arcSpaceDegrees / 2));
const arcEndDegrees = (90 + (arcSpaceDegrees / 2));
const boostGauge = {
    outerRadius: (143) / 2.5,
    innerRadius: (95) / 3,
    outerStrokeWidth: 1,
    innerStrokeWidth: 1,
    startAngle: arcStartDegrees,
    endAngle: arcEndDegrees,

    // Configuration for needle display
    needleLength: 24,
    needleWidth: 2,
    needleColor: "var(--color-primary)",

    // Configuration for radial numbers
    numberOffset: 8,
    numberStartAngle: arcStartDegrees + 5,
    numberEndAngle: arcEndDegrees - 5,
};

if (boostGaugeSvg) {
    renderBoostGauge(boostGaugeSvg);
}

/**
 * Renders a boost gauge visualization
 * @param {Element} svgElement - The SVG element to render into
 * @param {Object} telemetryData - Telemetry data
 * @param {Object} rpmDialPosition - Position information from the rpmDial
 */
export function renderBoostGauge(svgElement, telemetryData, rpmDialPosition) {
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

        // If we have position information from the rpmDial, use it to position the boost gauge
        let boostGaugeX = centerX;
        let boostGaugeY = centerY;

        if (rpmDialPosition) {
            // Position the boost gauge so its left side aligns with the right side of the rpmDial
            boostGaugeX = rpmDialPosition.rightEdge;
            boostGaugeY = rpmDialPosition.topEdge + boostGauge.outerRadius;
        }

        // Create arc generators
        const outerArc = d3.arc()
            .innerRadius(boostGauge.outerRadius - boostGauge.outerStrokeWidth)
            .outerRadius(boostGauge.outerRadius)
            .startAngle(boostGauge.startAngle * (Math.PI / 180))
            .endAngle(boostGauge.endAngle * (Math.PI / 180));

        const innerArc = d3.arc()
            .innerRadius(boostGauge.innerRadius - boostGauge.innerStrokeWidth / 2)
            .outerRadius(boostGauge.innerRadius + boostGauge.innerStrokeWidth / 2)
            .startAngle(boostGauge.startAngle * (Math.PI / 180))
            .endAngle(boostGauge.endAngle * (Math.PI / 180));

        // Draw outer arc
        svg.append("path")
            .attr("d", outerArc)
            .attr("transform", `translate(${boostGaugeX}, ${boostGaugeY})`)
            .attr("fill", "none")
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", boostGauge.outerStrokeWidth);

        // Draw inner arc
        svg.append("path")
            .attr("d", innerArc)
            .attr("transform", `translate(${boostGaugeX}, ${boostGaugeY})`)
            .attr("fill", "none")
            .attr("stroke", "var(--color-secondary)")
            .attr("stroke-width", boostGauge.innerStrokeWidth);

        // Draw connecting lines
        // Start line
        const startOuterPoint = polarToCartesian(boostGaugeX, boostGaugeY, 
            boostGauge.outerRadius, boostGauge.startAngle);
        const startInnerPoint = polarToCartesian(boostGaugeX, boostGaugeY, 
            boostGauge.innerRadius, boostGauge.startAngle);

        svg.append("line")
            .attr("x1", startOuterPoint.x)
            .attr("y1", startOuterPoint.y)
            .attr("x2", startInnerPoint.x)
            .attr("y2", startInnerPoint.y)
            .attr("stroke", "var(--color-secondary)")
            .attr("stroke-width", boostGauge.innerStrokeWidth);

        // End line
        const endOuterPoint = polarToCartesian(boostGaugeX, boostGaugeY, 
            boostGauge.outerRadius, boostGauge.endAngle);
        const endInnerPoint = polarToCartesian(boostGaugeX, boostGaugeY, 
            boostGauge.innerRadius, boostGauge.endAngle);

        svg.append("line")
            .attr("x1", endOuterPoint.x)
            .attr("y1", endOuterPoint.y)
            .attr("x2", endInnerPoint.x)
            .attr("y2", endInnerPoint.y)
            .attr("stroke", "var(--color-secondary)")
            .attr("stroke-width", boostGauge.innerStrokeWidth);

        // Add a small line at the very top pointing inward
        const topLineStartPoint = polarToCartesian(boostGaugeX, boostGaugeY, boostGauge.outerRadius, 0);
        const topLineEndPoint = polarToCartesian(boostGaugeX, boostGaugeY, boostGauge.outerRadius - 6, 0);

        svg.append("line")
            .attr("x1", topLineStartPoint.x)
            .attr("y1", topLineStartPoint.y)
            .attr("x2", topLineEndPoint.x)
            .attr("y2", topLineEndPoint.y)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", 1);

        // Add radial numbers (-4 on the left and 4 on the right)
        const radialNumbers = new RadialNumbers({
            startAngle: boostGauge.numberStartAngle,
            endAngle: boostGauge.numberEndAngle,
            outerRadius: boostGauge.outerRadius,
            numberOffset: boostGauge.numberOffset,
            outerStrokeWidth: boostGauge.outerStrokeWidth
        });

        // Create array with just two numbers: -4 and 4
        const numbers = [-4, 4];

        // Render the numbers
        radialNumbers.renderNumbers(svg, boostGaugeX, boostGaugeY, numbers, {
            cssClass: "small-attribute-decimal",
            isDefault: false,
            rotate180: true
        });

        // Add needle display centered at 0, top middle of the gauge
        // Get boost value from telemetry data (default to 0)
        const boostValue = (telemetryData && telemetryData.Boost !== undefined) 
            ? telemetryData.Boost 
            : 0; // Default value of 0

        // Calculate needle angle (0 degrees is top, positive values rotate clockwise)
        // Map boost value from -4 to 4 to angle from left to right of the gauge
        const boostRange = 8; // -4 to 4
        const normalizedBoost = (boostValue + 4) / boostRange; // 0 to 1
        const needleAngle = boostGauge.startAngle + normalizedBoost * (boostGauge.endAngle - boostGauge.startAngle);

        // Calculate needle points
        const needleBasePoint = polarToCartesian(boostGaugeX, boostGaugeY, boostGauge.innerRadius, needleAngle);
        const needleTipPoint = polarToCartesian(boostGaugeX, boostGaugeY, boostGauge.outerRadius, needleAngle);

        // Draw needle
        svg.append("line")
            .attr("x1", needleBasePoint.x)
            .attr("y1", needleBasePoint.y)
            .attr("x2", needleTipPoint.x)
            .attr("y2", needleTipPoint.y)
            .attr("stroke", boostGauge.needleColor)
            .attr("stroke-width", boostGauge.needleWidth);

        // Add "PSI" text below the gauge
        svg.append("text")
            .attr("x", boostGaugeX)
            .attr("y", boostGaugeY)
            .attr("text-anchor", "middle")
            .attr("class", "small-attribute-title-2")
            .attr("fill", "var(--color-primary-40)")
            .text("PSI");

        // Extract integer and decimal parts
        const integerPart = Math.floor(Math.abs(boostValue));
        const decimalPart = Math.abs(boostValue).toFixed(2).split('.')[1];

        // Format integer part with leading zeros
        const formattedInteger = formatNumberWithLeadingZeros(integerPart, 1);

        // Create a container for the integer part
        const integerContainer = svg.append("g")
            .attr("transform", `translate(${boostGaugeX}, ${boostGaugeY + 14})`);

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

        // Add decimal part of PSI value right next to the integer part
        integerContainer.append("text")
            .attr("x", xOffset + 4)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("class", "small-attribute-decimal")
            .attr("fill", "var(--color-primary)")
            .text(`.${decimalPart}`);
    }
}
