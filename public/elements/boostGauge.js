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
import fields from '../fields.js';

const boostGaugeSvgElement = document.getElementById("boostGaugeSvg");
const boostGaugeSvg = boostGaugeSvgElement ? d3.select("#boostGaugeSvg") : null;

// Configuration parameters for boost gauge visualization
const arcSpaceDegrees = 90;
const arcStartDegrees = (-180 + (arcSpaceDegrees / 2));
const arcEndDegrees = (90 + (arcSpaceDegrees / 2));

// RPM dial radius for positioning calculations
const rpmDialOuterRadius = 143;

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

        const centerX = svgWidth / 2;
        const centerY = svgHeight / 2;

        // Clear existing content
        svg.selectAll("*").remove();

        // Default position for the boost gauge
        let boostGaugeX = centerX;
        let boostGaugeY = centerY;

        if (rpmDialPosition) {
            const rpmDialCenterX = rpmDialPosition.rightEdge - rpmDialOuterRadius;
            const rpmDialRightEdge = rpmDialCenterX + rpmDialOuterRadius;
            // Position the boost gauge to the right of the RPM dial
            boostGaugeX = rpmDialRightEdge + 2 * boostGauge.outerRadius;
            boostGaugeY = rpmDialPosition.topEdge + boostGauge.outerRadius;
        } else {
            boostGaugeX = centerX + rpmDialOuterRadius + 2 * boostGauge.outerRadius;
            boostGaugeY = centerY;
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

        // Outer arc
        svg.append("path")
            .attr("d", outerArc)
            .attr("transform", `translate(${boostGaugeX}, ${boostGaugeY})`)
            .attr("fill", "none")
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", boostGauge.outerStrokeWidth);

        // Inner arc
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

        // Radial numbers
        const radialNumbers = new RadialNumbers({
            startAngle: boostGauge.numberStartAngle,
            endAngle: boostGauge.numberEndAngle,
            outerRadius: boostGauge.outerRadius,
            numberOffset: boostGauge.numberOffset,
            outerStrokeWidth: boostGauge.outerStrokeWidth
        });

        const numbers = [-4, 4];

        // Render the numbers
        radialNumbers.renderNumbers(svg, boostGaugeX, boostGaugeY, numbers, {
            cssClass: "small-attribute-decimal",
            isDefault: false,
            rotate180: true
        });

        const boostField = fields.find(field => field.name === 'Boost');

        // Boost
        let boostValue = 0;
        if (telemetryData && telemetryData.Boost !== undefined) {
            // Apply transform
            if (boostField && boostField.transform) {
                boostValue = boostField.transform(telemetryData.Boost);
            } else {
                boostValue = telemetryData.Boost;
            }
        }

        const needleAngle = Math.min(Math.max((boostValue / 4), -1), 1) * (boostGauge.endAngle);

        // Create a conic gradient centered at top dead center
        const gradientId = "boostGaugeGradient";
        const clipPathId = "boostGaugeClipPath";

        // Create defs section for gradient and clip path
        const defs = svg.append("defs");

        // Create a clip path for the arc section
        const startAngleForClip = 0; // Top
        const endAngleForClip = needleAngle;

        defs.append("clipPath")
            .attr("id", clipPathId)
            .append("path")
            .attr("d", d3.arc()
                .innerRadius(boostGauge.innerRadius)
                .outerRadius(boostGauge.outerRadius)
                .startAngle(startAngleForClip * (Math.PI / 180))
                .endAngle(endAngleForClip * (Math.PI / 180))
            )
            .attr("transform", `translate(${boostGaugeX}, ${boostGaugeY})`);

        // Radial gradient
        const gradient = defs.append("radialGradient")
            .attr("id", gradientId)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("cx", boostGaugeX)
            .attr("cy", boostGaugeY)
            .attr("r", boostGauge.outerRadius * 2)
            .attr("fx", polarToCartesian(boostGaugeX, boostGaugeY, boostGauge.innerRadius, 0).x)
            .attr("fy", polarToCartesian(boostGaugeX, boostGaugeY, boostGauge.innerRadius, 0).y)
            .attr("spreadMethod", "pad");

        // Start with black at 0% opacity at top dead center
        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "black")
            .attr("stop-opacity", "0");

        // Add color-boost-gauge-neg with 20% opacity on the left side
        gradient.append("stop")
            .attr("offset", "25%")
            .attr("stop-color", "var(--color-boost-gauge-neg)")
            .attr("stop-opacity", "0.2");

        // Add color-boost-gauge-pos with 20% opacity on the right side
        gradient.append("stop")
            .attr("offset", "75%")
            .attr("stop-color", "var(--color-boost-gauge-pos)")
            .attr("stop-opacity", "0.2");

        // Create a full circle for the gradient fill that will be clipped
        const gradientCircle = svg.append("circle")
            .attr("cx", boostGaugeX)
            .attr("cy", boostGaugeY)
            .attr("r", boostGauge.outerRadius)
            .attr("fill", `url(#${gradientId})`)
            .attr("clip-path", `url(#${clipPathId})`)
            .attr("stroke", "none");

        // Needle
        const needleBasePoint = polarToCartesian(boostGaugeX, boostGaugeY, boostGauge.innerRadius, needleAngle);
        const needleTipPoint = polarToCartesian(boostGaugeX, boostGaugeY, boostGauge.outerRadius, needleAngle);

        svg.append("line")
            .attr("x1", needleBasePoint.x)
            .attr("y1", needleBasePoint.y)
            .attr("x2", needleTipPoint.x)
            .attr("y2", needleTipPoint.y)
            .attr("stroke", boostGauge.needleColor)
            .attr("stroke-width", boostGauge.needleWidth);

        // Text
        svg.append("text")
            .attr("x", boostGaugeX)
            .attr("y", boostGaugeY)
            .attr("text-anchor", "middle")
            .attr("class", "small-attribute-title-2")
            .attr("fill", "var(--color-primary-40)")
            .text("BAR");

        // Check for default values
        const isDefaultBoost = !(telemetryData && telemetryData.Boost !== undefined);

        // Extract integer and decimal parts
        const isNegative = boostValue < 0;
        const integerPart = Math.floor(Math.abs(boostValue));
        const decimalPart = Math.abs(boostValue).toFixed(2).split('.')[1];

        // Format
        const formattedInteger = formatNumberWithLeadingZeros(integerPart, 1);

        const integerContainer = svg.append("g")
            .attr("transform", `translate(${boostGaugeX}, ${boostGaugeY + 14})`);
        let totalWidth = formattedInteger.length * 8;
        let xOffset = -totalWidth / 2;

        integerContainer.append("text")
            .attr("x", xOffset - 8)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("class", "small-attribute-integer")
            .attr("fill", isNegative ? "color-primary" : "color-primary-40")
            .text("-");

        // Characters
        formattedInteger.forEach(char => {
            integerContainer.append("text")
                .attr("x", xOffset)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .attr("class", "small-attribute-integer")
                .attr("fill", "var(--color-primary)")
                .attr("opacity", isDefaultBoost ? 0.5 : char.opacity)
                .text(char.text);

            xOffset += 8;
        });

        // Decimal part
        integerContainer.append("text")
            .attr("x", xOffset + 4)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("class", "small-attribute-decimal")
            .attr("fill", "var(--color-primary)")
            .attr("opacity", isDefaultBoost ? 0.5 : 1)
            .text(`.${decimalPart}`);

        // Horsepower display
        // Power from Telemetry
        const powerField = fields.find(field => field.name === 'Power');
        let powerValue = 0;
        if (telemetryData && telemetryData.Power !== undefined) {
            if (powerField && powerField.transform) {
                powerValue = powerField.transform(telemetryData.Power);
            } else {
                powerValue = telemetryData.Power;
            }
        }


        const hpValue = Math.round(powerValue);
        const isDefaultPower = !(telemetryData && telemetryData.Power !== undefined);
        // Format with leading zeros
        const formattedHP = formatNumberWithLeadingZeros(hpValue, 4);
        const hpContainer = svg.append("g")
            .attr("transform", `translate(${boostGaugeX}, ${boostGaugeY + boostGauge.outerRadius + 12})`);

        let hpXOffset = -16;

        // Character
        formattedHP.forEach(char => {
            hpContainer.append("text")
                .attr("x", hpXOffset)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .attr("class", "small-attribute-integer")
                .attr("fill", "var(--color-primary)")
                .attr("opacity", isDefaultPower ? 0.5 : char.opacity)
                .text(char.text);

            hpXOffset += 8;
        });

        // label
        hpContainer.append("text")
            .attr("x", 16)
            .attr("y", 0) // Position below the value
            .attr("text-anchor", "left")
            .attr("class", "small-attribute-title-2")
            .attr("fill", "var(--color-primary-40)")
            .text("HP");

        // Torque display
        const torqueField = fields.find(field => field.name === 'Torque');
        let torqueValue = 0;
        if (telemetryData && telemetryData.Torque !== undefined) {
            torqueValue = telemetryData.Torque;
        }


        const nmValue = Math.round(torqueValue);
        const isDefaultTorque = !(telemetryData && telemetryData.Torque !== undefined);
        const formattedNM = formatNumberWithLeadingZeros(nmValue, 4);
        const nmContainer = svg.append("g")
            .attr("transform", `translate(${boostGaugeX}, ${boostGaugeY + boostGauge.outerRadius + 12 + 18})`);

        let nmXOffset = -16;

        // Character
        formattedNM.forEach(char => {
            nmContainer.append("text")
                .attr("x", nmXOffset)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .attr("class", "small-attribute-integer")
                .attr("fill", "var(--color-primary)")
                .attr("opacity", isDefaultTorque ? 0.5 : char.opacity)
                .text(char.text);

            nmXOffset += 8;
        });

        // Label
        nmContainer.append("text")
            .attr("x", 16)
            .attr("y", 0)
            .attr("text-anchor", "left")
            .attr("class", "small-attribute-title-2")
            .attr("fill", "var(--color-primary-40)")
            .text("N-M");
    }
}
