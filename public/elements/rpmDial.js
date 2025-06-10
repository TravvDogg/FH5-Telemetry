/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        rpmDial.js: 
          Renders an RPM dial visualization
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

import { formatNumberWithLeadingZeros } from './numberUtils.js';
import { RadialNumbers } from './radialNumbers.js';
import { polarToCartesian } from './geometryUtils.js';

const rpmDialSvgElement = document.getElementById("rpmDialSvg");
const rpmDialSvg = rpmDialSvgElement ? d3.select("#rpmDialSvg") : null;

// Configuration parameters for RPM dial visualization
const arcSpaceDegrees = 90;
const arcStartDegrees = (-180 + (arcSpaceDegrees / 2));
const arcEndDegrees = (90 + (arcSpaceDegrees / 2));
const rpmDial = {
    outerRadius: 143,      // Radius of the outer arc
    innerRadius: 95,       // Radius of the inner arc
    outerStrokeWidth: 2,   // Stroke width of the outer arc
    innerStrokeWidth: 1,   // Stroke width of the inner arc
    startAngle: arcStartDegrees,       // 45 degrees left of bottom (180 + 45)
    endAngle: arcEndDegrees,         // 45 degrees right of bottom (360 - 45)
    numberOffset: 8,       // Distance from inner arc to numbers in px
    numberStartAngle: arcStartDegrees + 5, // 50 degrees left of bottom (180 + 50)
    numberEndAngle: arcEndDegrees - 5,    // 50 degrees right of bottom (360 - 50)
    gearCircleRadius: 30,  // Radius of the gear indication circle
    gearCircleStrokeWidth: 4, // Stroke width of the gear indication circle
    yOffset: 12,           // Vertical offset to raise the dial (except speed and KMH)

    // Configuration for brake, throttle, and steering arcs
    brakeThrottleArcAngle: 55,  // Angle of the brake and throttle arcs in degrees
    steeringArcAngle: 90,       // Angle of the steering arc in degrees
    controlArcOuterRadius: 155, // Outer radius of the control arcs (outerRadius + 12)
    controlArcInnerRadius: 148,  // Inner radius of the control arcs (innerRadius + 3)
    controlArcStrokeWidth: 1,   // Stroke width of the control arcs

    // Colors for the control arcs
    brakeColor: "var(--color-brake)",      // Red color for brake arc
    throttleColor: "var(--color-throttle)",   // Blue color for throttle arc
    steeringColor: "var(--color-steering)"    // Green color for steering arc
};

if (rpmDialSvg) {
    renderRpmDial(rpmDialSvg);
}

/**
 * Renders an RPM dial visualization
 * @param {Element} svgElement - The SVG element to render into
 * @param {Object} telemetryData - Telemetry data
 * @returns {Object} - Position information for external components
 */
export function renderRpmDial(svgElement, telemetryData) {
    if (svgElement) {
        const svg = d3.select(svgElement);

        // Get the SVG dimensions
        const svgWidth = parseInt(svg.style("width") || svg.attr("width"));
        const svgHeight = parseInt(svg.style("height") || svg.attr("height"));

        // Calculate the center point (horizontally centered, bottom aligned)
        const centerX = svgWidth / 2;
        const centerY = svgHeight - rpmDial.outerRadius;

        // Create a separate centerY for the dial (raised by yOffset)
        const dialCenterY = centerY - rpmDial.yOffset;

        // Clear existing content
        svg.selectAll("*").remove();

        // Create arc generators
        const outerArc = d3.arc()
            .innerRadius(rpmDial.outerRadius - rpmDial.outerStrokeWidth)
            .outerRadius(rpmDial.outerRadius)
            .startAngle(rpmDial.startAngle * (Math.PI / 180))
            .endAngle(rpmDial.endAngle * (Math.PI / 180));

        const innerArc = d3.arc()
            .innerRadius(rpmDial.innerRadius - rpmDial.innerStrokeWidth / 2)
            .outerRadius(rpmDial.innerRadius + rpmDial.innerStrokeWidth / 2)
            .startAngle(rpmDial.startAngle * (Math.PI / 180))
            .endAngle(rpmDial.endAngle * (Math.PI / 180));

        // Draw outer arc
        svg.append("path")
            .attr("d", outerArc)
            .attr("transform", `translate(${centerX}, ${dialCenterY})`)
            .attr("fill", "none")
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", rpmDial.outerStrokeWidth);

        // Draw inner arc
        svg.append("path")
            .attr("d", innerArc)
            .attr("transform", `translate(${centerX}, ${dialCenterY})`)
            .attr("fill", "none")
            .attr("stroke", "var(--color-secondary)")
            .attr("stroke-width", rpmDial.innerStrokeWidth);

        // Draw connecting lines
        // Start line
        const startOuterPoint = polarToCartesian(centerX, dialCenterY, rpmDial.outerRadius, rpmDial.startAngle);
        const startInnerPoint = polarToCartesian(centerX, dialCenterY, rpmDial.innerRadius, rpmDial.startAngle);

        svg.append("line")
            .attr("x1", startOuterPoint.x)
            .attr("y1", startOuterPoint.y)
            .attr("x2", startInnerPoint.x)
            .attr("y2", startInnerPoint.y)
            .attr("stroke", "var(--color-secondary)")
            .attr("stroke-width", rpmDial.innerStrokeWidth);

        // End line
        const endOuterPoint = polarToCartesian(centerX, dialCenterY, rpmDial.outerRadius, rpmDial.endAngle);
        const endInnerPoint = polarToCartesian(centerX, dialCenterY, rpmDial.innerRadius, rpmDial.endAngle);

        svg.append("line")
            .attr("x1", endOuterPoint.x)
            .attr("y1", endOuterPoint.y)
            .attr("x2", endInnerPoint.x)
            .attr("y2", endInnerPoint.y)
            .attr("stroke", "var(--color-secondary)")
            .attr("stroke-width", rpmDial.innerStrokeWidth);

        // Add RPM numbers
        let engineMaxRpm = 10000; // Default value
        if (telemetryData && telemetryData.EngineMaxRpm) {
            engineMaxRpm = telemetryData.EngineMaxRpm;
        }

        const maxRpmThousands = Math.ceil(engineMaxRpm / 1000);
        const numberCount = maxRpmThousands + 1; // +1 to include 0

        // Create array of numbers to display
        const numbers = Array.from({ length: numberCount }, (_, i) => i);

        // Create RadialNumbers instance
        const radialNumbers = new RadialNumbers({
            startAngle: rpmDial.numberStartAngle,
            endAngle: rpmDial.numberEndAngle,
            outerRadius: rpmDial.outerRadius,
            numberOffset: rpmDial.numberOffset,
            outerStrokeWidth: rpmDial.outerStrokeWidth
        });

        // Render the numbers
        radialNumbers.renderNumbers(svg, centerX, dialCenterY, numbers, {
            cssClass: "small-attribute-decimal",
            isDefault: false
        });

        // Add current RPM indicator (with default if telemetry data is unavailable)
        const currentRpm = (telemetryData && telemetryData.CurrentEngineRpm !== undefined) 
            ? telemetryData.CurrentEngineRpm 
            : 0;

        // Calculate the exact ratio based on the current RPM and max RPM
        const rpmRatio = Math.min(currentRpm / engineMaxRpm, 1.0);
        const indicatorAngle = rpmDial.startAngle + rpmRatio * (rpmDial.endAngle - rpmDial.startAngle);

        // Draw indicator line
        const indicatorInnerPoint = polarToCartesian(centerX, dialCenterY, rpmDial.innerRadius, indicatorAngle);
        const indicatorOuterPoint = polarToCartesian(centerX, dialCenterY, rpmDial.outerRadius, indicatorAngle);

        svg.append("line")
            .attr("x1", indicatorInnerPoint.x)
            .attr("y1", indicatorInnerPoint.y)
            .attr("x2", indicatorOuterPoint.x)
            .attr("y2", indicatorOuterPoint.y)
            .attr("stroke", "var(--color-rpm-indicator)")
            .attr("stroke-width", 2);

        // Add gear indication circle in the middle of the large arc
        svg.append("circle")
            .attr("cx", centerX)
            .attr("cy", dialCenterY)
            .attr("r", rpmDial.gearCircleRadius)
            .attr("fill", "none")
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", rpmDial.gearCircleStrokeWidth)
            .attr("stroke-location", "inside");

        // Add gear text in the middle of the circle
        let gearText = "0";
        let isDefaultGear = true;

        if (telemetryData && telemetryData.Gear !== undefined) {
            gearText = telemetryData.Gear === 0 ? "R" : telemetryData.Gear.toString();
            isDefaultGear = false;
        }

        svg.append("text")
            .attr("x", centerX)
            .attr("y", dialCenterY + 3)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("class", "large-numbers")
            .attr("fill", "var(--color-primary)")
            .text(gearText);

        // Add "RPM" text below the gear circle
        svg.append("text")
            .attr("x", centerX)
            .attr("y", dialCenterY + rpmDial.gearCircleRadius + 12)
            .attr("text-anchor", "middle")
            .attr("class", "small-attribute-title-2")
            .attr("fill", "var(--color-primary-40)")
            .text("RPM");

        // Calculate position information for external components
        const rightEdge = centerX + rpmDial.outerRadius;
        const topEdge = dialCenterY - rpmDial.outerRadius;

        // Add RPM value below the "RPM" text (with default if telemetry data is unavailable)
        const rpmValue = (telemetryData && telemetryData.CurrentEngineRpm !== undefined) 
            ? Math.floor(telemetryData.CurrentEngineRpm) 
            : 0; // Default value of 0

        const isDefaultRpm = !(telemetryData && telemetryData.CurrentEngineRpm !== undefined);
        const formattedRpm = formatNumberWithLeadingZeros(rpmValue, 5, true);

        // Create a container for the RPM value
        const rpmContainer = svg.append("g")
            .attr("transform", `translate(${centerX}, ${dialCenterY + rpmDial.gearCircleRadius + 20})`);

        // Calculate total width for centering
        let totalWidth = 0;
        formattedRpm.forEach(char => {
            // Use less space for comma (-2px on each side)
            totalWidth += (char.text === ',') ? 4 : 8;
        });

        // Center the text by starting at negative half of total width
        let xOffset = -totalWidth / 2;

        formattedRpm.forEach(char => {
            rpmContainer.append("text")
                .attr("x", xOffset)
                .attr("y", 4)
                .attr("text-anchor", "middle")
                .attr("class", "small-attribute-integer")
                .attr("fill", "var(--color-primary)")
                .attr("opacity", char.opacity)
                .text(char.text);

            // Use less space for comma (-2px on each side)
            xOffset += (char.text === ',') ? 5 : 8; // Adjust spacing for monospaced font
        });

        // Add speed display at the bottom of the circle (with default if telemetry data is unavailable)
        // Apply transformation to convert to km/h (multiply by 3.6)
        const speedValue = (telemetryData && telemetryData.Speed !== undefined) 
            ? Math.floor(Math.abs(telemetryData.Speed * 3.6)) 
            : 0; // Default value of 0

        const isDefaultSpeed = !(telemetryData && telemetryData.Speed !== undefined);
        const formattedSpeed = formatNumberWithLeadingZeros(speedValue, 3);

        // Create a container for the speed value
        const speedContainer = svg.append("g")
            .attr("transform", `translate(${centerX}, ${centerY})`);

        // Add each character with appropriate opacity
        xOffset = (-formattedSpeed.length * 25) + 25; // Center the text

        formattedSpeed.forEach(char => {
            speedContainer.append("text")
                .attr("x", xOffset)
                .attr("y", rpmDial.outerRadius - 8)
                .attr("text-anchor", "middle")
                .attr("class", "speed")
                .attr("style", "font-family: 'Lekton', monospace;") // Ensure monospaced font
                .attr("fill", "var(--color-primary)")
                .attr("opacity", char.opacity)
                .text(char.text);

            xOffset += 50; // Adjust spacing for monospaced font
        });

        // Add "KM/H" text to the right of the speed value
        speedContainer.append("text")
            .attr("x", xOffset - 25)
            .attr("y", rpmDial.outerRadius - 18)
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "middle")
            .attr("class", "suffix-bottom-right")
            .attr("fill", "var(--color-primary-40)")
            .text("KM/H");

        // ===== BRAKE ARC (LEFT SIDE) =====
        // Calculate angles for the brake arc
        const brakeStartAngle = rpmDial.startAngle;
        const brakeEndAngle = brakeStartAngle + rpmDial.brakeThrottleArcAngle;

        // Create brake arc generator
        const brakeArc = d3.arc()
            .innerRadius(rpmDial.controlArcInnerRadius)
            .outerRadius(rpmDial.controlArcOuterRadius)
            .startAngle(brakeStartAngle * (Math.PI / 180))
            .endAngle(brakeEndAngle * (Math.PI / 180));

        // Draw brake arc outline
        svg.append("path")
            .attr("d", brakeArc)
            .attr("transform", `translate(${centerX}, ${dialCenterY})`)
            .attr("fill", "none")
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", rpmDial.controlArcStrokeWidth);

        // Add "BRK" text at the bottom of the brake arc
        const brakeTextPoint = polarToCartesian(centerX, dialCenterY, rpmDial.controlArcOuterRadius + 10, brakeStartAngle);
        svg.append("text")
            .attr("x", brakeTextPoint.x)
            .attr("y", brakeTextPoint.y)
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .attr("fill", "var(--color-primary)")
            .attr("class", "small-attribute-title-2")
            .attr("transform", `rotate(${brakeStartAngle - 177}, ${brakeTextPoint.x}, ${brakeTextPoint.y})`)
            .text("BRK");

        // Draw filled brake arc (with default if telemetry data is unavailable)
        const brakeValue = (telemetryData && telemetryData.Brake !== undefined) 
            ? telemetryData.Brake 
            : 0; // Default value of 0

        const isDefaultBrake = !(telemetryData && telemetryData.Brake !== undefined);
        const brakeRatio = -brakeValue / 255;

        // For default value, show a small indicator
        const filledBrakeEndAngle = brakeStartAngle - (brakeRatio * (isDefaultBrake ? 5 : rpmDial.brakeThrottleArcAngle));

        const filledBrakeArc = d3.arc()
            .innerRadius(rpmDial.controlArcInnerRadius)
            .outerRadius(rpmDial.controlArcOuterRadius)
            .startAngle(brakeStartAngle * (Math.PI / 180))
            .endAngle(filledBrakeEndAngle * (Math.PI / 180));

        svg.append("path")
            .attr("d", filledBrakeArc)
            .attr("transform", `translate(${centerX}, ${dialCenterY})`)
            .attr("fill", isDefaultBrake ? "var(--color-secondary)" : rpmDial.brakeColor)
            .attr("opacity", isDefaultBrake ? 0.5 : 1) // Reduce opacity for default values
            .attr("stroke", "none");

        // ===== THROTTLE ARC (RIGHT SIDE) =====
        // Calculate angles for the throttle arc
        const throttleStartAngle = rpmDial.endAngle;
        const throttleEndAngle = throttleStartAngle - rpmDial.brakeThrottleArcAngle;

        // Create throttle arc generator
        const throttleArc = d3.arc()
            .innerRadius(rpmDial.controlArcInnerRadius)
            .outerRadius(rpmDial.controlArcOuterRadius)
            .startAngle(throttleStartAngle * (Math.PI / 180))
            .endAngle(throttleEndAngle * (Math.PI / 180));

        // Draw throttle arc outline
        svg.append("path")
            .attr("d", throttleArc)
            .attr("transform", `translate(${centerX}, ${dialCenterY})`)
            .attr("fill", "none")
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", rpmDial.controlArcStrokeWidth);

        // Add "THR" text at the bottom of the throttle arc
        const throttleTextPoint = polarToCartesian(centerX, dialCenterY, rpmDial.controlArcOuterRadius + 10, throttleStartAngle);
        svg.append("text")
            .attr("x", throttleTextPoint.x)
            .attr("y", throttleTextPoint.y)
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "middle")
            .attr("fill", "var(--color-primary)")
            .attr("class", "small-attribute-title-2")
            .attr("transform", `rotate(${throttleStartAngle - 183}, ${throttleTextPoint.x}, ${throttleTextPoint.y})`)
            .text("THR");

        // Draw filled throttle arc (with default if telemetry data is unavailable)
        const throttleValue = (telemetryData && telemetryData.Throttle !== undefined) 
            ? -telemetryData.Throttle 
            : 0; // Default value of 0

        const isDefaultThrottle = !(telemetryData && telemetryData.Throttle !== undefined);
        const throttleRatio = throttleValue / 255;

        // For default value, show a small indicator
        const filledThrottleEndAngle = throttleStartAngle + (throttleRatio * (isDefaultThrottle ? 5 : rpmDial.brakeThrottleArcAngle));

        const filledThrottleArc = d3.arc()
            .innerRadius(rpmDial.controlArcInnerRadius)
            .outerRadius(rpmDial.controlArcOuterRadius)
            .startAngle(throttleStartAngle * (Math.PI / 180))
            .endAngle(filledThrottleEndAngle * (Math.PI / 180));

        svg.append("path")
            .attr("d", filledThrottleArc)
            .attr("transform", `translate(${centerX}, ${dialCenterY})`)
            .attr("fill", isDefaultThrottle ? "var(--color-secondary)" : rpmDial.throttleColor)
            .attr("opacity", isDefaultThrottle ? 0.5 : 1) // Reduce opacity for default values
            .attr("stroke", "none");

        // ===== STEERING ARC (TOP) =====
        // Calculate angles for the steering arc
        const steeringCenterAngle = 0; // Top of the circle
        const steeringStartAngle = steeringCenterAngle - (rpmDial.steeringArcAngle / 2);
        const steeringEndAngle = steeringCenterAngle + (rpmDial.steeringArcAngle / 2);

        // Create steering arc generator
        const steeringArc = d3.arc()
            .innerRadius(rpmDial.controlArcInnerRadius)
            .outerRadius(rpmDial.controlArcOuterRadius)
            .startAngle(steeringStartAngle * (Math.PI / 180))
            .endAngle(steeringEndAngle * (Math.PI / 180));

        // Draw steering arc outline
        svg.append("path")
            .attr("d", steeringArc)
            .attr("transform", `translate(${centerX}, ${dialCenterY})`)
            .attr("fill", "none")
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", rpmDial.controlArcStrokeWidth);

        // Add horizontal line in the middle of the steering arc
        const lineStartPoint = polarToCartesian(centerX, dialCenterY, rpmDial.controlArcInnerRadius, steeringCenterAngle);
        const lineEndPoint = polarToCartesian(centerX, dialCenterY, rpmDial.controlArcInnerRadius + 2, steeringCenterAngle);

        svg.append("line")
            .attr("x1", centerX)
            .attr("y1", dialCenterY - rpmDial.controlArcOuterRadius)
            .attr("x2", centerX)
            .attr("y2", dialCenterY - rpmDial.controlArcOuterRadius + 2)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", 1);

        // Add "STR" text above the steering arc
        const steeringTextPoint = polarToCartesian(centerX, dialCenterY, rpmDial.controlArcOuterRadius + 10, steeringCenterAngle);
        svg.append("text")
            .attr("x", steeringTextPoint.x)
            .attr("y", steeringTextPoint.y + 3)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", "var(--color-primary)")
            .attr("class", "small-attribute-title-2")
            .text("STR");

        // Draw filled steering arc (with default if telemetry data is unavailable)
        const steerValue = (telemetryData && telemetryData.Steer !== undefined) 
            ? telemetryData.Steer 
            : 0; // Default value of 0

        const isDefaultSteer = !(telemetryData && telemetryData.Steer !== undefined);
        const steerRatio = steerValue / 127; // -1 to 1

        // Determine the start and end angles based on the steer value
        let filledSteeringStartAngle, filledSteeringEndAngle;

        // For default value, show a small indicator at center
        const steeringArcSize = isDefaultSteer ? 5 : (rpmDial.steeringArcAngle / 2);

        if (steerValue >= 0) {
            // Steering right (positive values)
            filledSteeringStartAngle = steeringCenterAngle;
            filledSteeringEndAngle = steeringCenterAngle + (steerRatio * steeringArcSize);
        } else {
            // Steering left (negative values)
            filledSteeringStartAngle = steeringCenterAngle + (steerRatio * steeringArcSize);
            filledSteeringEndAngle = steeringCenterAngle;
        }

        const filledSteeringArc = d3.arc()
            .innerRadius(rpmDial.controlArcInnerRadius)
            .outerRadius(rpmDial.controlArcOuterRadius)
            .startAngle(filledSteeringStartAngle * (Math.PI / 180))
            .endAngle(filledSteeringEndAngle * (Math.PI / 180));

        svg.append("path")
            .attr("d", filledSteeringArc)
            .attr("transform", `translate(${centerX}, ${dialCenterY})`)
            .attr("fill", isDefaultSteer ? "var(--color-secondary)" : rpmDial.steeringColor)
            .attr("opacity", isDefaultSteer ? 0.5 : 1) // Reduce opacity for default values
            .attr("stroke", "none");

        // Return position information for external components
        return {
            rightEdge: rightEdge,
            topEdge: topEdge
        };
    }

    // Return default position if SVG element is not valid
    return null;
}
