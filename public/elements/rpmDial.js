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
import { getCachedAlertSvg } from './alertSvgCache.js';

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

    // Configuration for indicator circles
    indicatorCircles: {
        count: 8,              // Number of indicator circles
        radius: 17,            // Radius of each indicator circle
        strokeWidth: 2,        // Stroke width of each indicator circle
        strokeColor: "white",  // Stroke color of each indicator circle
        defaultFill: "var(--color-primary)",  // Default fill color
        activeFill: "var(--color-warning-activation)"  // Fill color when activated
    },

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
        const rpmRatio = currentRpm / (maxRpmThousands * 1000);
        const indicatorAngle = rpmDial.startAngle + rpmRatio * (rpmDial.endAngle - rpmDial.startAngle);

        // Create a conic gradient from start to needle position
        const gradientId = "rpmDialGradient";
        const clipPathId = "rpmDialClipPath";

        // Create defs section for gradient and clip path
        const defs = svg.append("defs");

        // Create a clip path for the arc section
        defs.append("clipPath")
            .attr("id", clipPathId)
            .append("path")
            .attr("d", d3.arc()
                .innerRadius(rpmDial.innerRadius)
                .outerRadius(rpmDial.outerRadius)
                .startAngle(rpmDial.startAngle * (Math.PI / 180))
                .endAngle(indicatorAngle * (Math.PI / 180))
            )
            .attr("transform", `translate(${centerX}, ${dialCenterY})`);

        // Create a conic gradient definition using SVG's radial gradient to simulate a conic effect
        const gradient = defs.append("radialGradient")
            .attr("id", gradientId)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("cx", centerX)
            .attr("cy", dialCenterY)
            .attr("r", rpmDial.outerRadius * 2) // Larger radius for smoother gradient
            .attr("fx", polarToCartesian(centerX, dialCenterY, rpmDial.innerRadius, rpmDial.startAngle).x)
            .attr("fy", polarToCartesian(centerX, dialCenterY, rpmDial.innerRadius, rpmDial.startAngle).y)
            .attr("spreadMethod", "pad");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "black")
            .attr("stop-opacity", "0");

        gradient.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "gray")
            .attr("stop-opacity", "0.5");

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "white")
            .attr("stop-opacity", "1");

        // Create a full circle for the gradient fill that will be clipped
        const gradientCircle = svg.append("circle")
            .attr("cx", centerX)
            .attr("cy", dialCenterY)
            .attr("r", rpmDial.outerRadius)
            .attr("fill", `url(#${gradientId})`)
            .attr("clip-path", `url(#${clipPathId})`)
            .attr("stroke", "none");

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

        // Draw the 8 indicator circles evenly spaced between gear circle and inner radius
        const circleRadius = rpmDial.indicatorCircles.radius;
        const circleCount = rpmDial.indicatorCircles.count;
        const circleDistance = (rpmDial.innerRadius - rpmDial.gearCircleRadius - circleRadius * 2) / 2;
        const circleOrbitRadius = rpmDial.gearCircleRadius + circleDistance + circleRadius;

        // Create a group for all indicator circles
        const indicatorCirclesGroup = svg.append("g")
            .attr("transform", `translate(${centerX}, ${dialCenterY})`)
            .attr("id", "indicator-circles-group");

        // Calculate the angular offset needed to prevent circles from extending beyond the arc edges
        const circleRadiusAngle = Math.atan2(circleRadius, circleOrbitRadius) * (180 / Math.PI);

        // Adjust the start and end angles to account for the circle radius
        const adjustedStartAngle = rpmDial.startAngle + circleRadiusAngle;
        const adjustedEndAngle = rpmDial.endAngle - circleRadiusAngle;

        // Calculate the effective angle range for positioning the circles
        const effectiveAngleRange = adjustedEndAngle - adjustedStartAngle;

        // Draw each indicator circle
        for (let i = 0; i < circleCount; i++) {
            // Calculate angle for this circle (evenly distributed along the adjusted arc)
            let angle;
            if (circleCount === 1) {
                // If there's only one circle, place it in the middle
                angle = (adjustedStartAngle + effectiveAngleRange / 2) * (Math.PI / 180);
            } else {
                // Otherwise, distribute evenly along the adjusted arc
                angle = (adjustedStartAngle + (i * (effectiveAngleRange / (circleCount - 1)))) * (Math.PI / 180);
            }

            // Calculate position
            const x = Math.sin(angle) * circleOrbitRadius;
            const y = -Math.cos(angle) * circleOrbitRadius;

            // Determine if this circle should be active based on telemetry data
            // This is a placeholder - actual activation logic will depend on specific requirements
            let isActive = false;

            // Activation logic based on the specified requirements
            if (telemetryData) {
                switch(i) {
                    case 0: // Circle 1: none (no activation)
                        isActive = false;
                        break;
                    case 1: // Circle 2: any suspension bottom out (any suspensiontravelnorm at 1)
                        isActive = telemetryData.NormSuspensionTravelFl === 1 ||
                                  telemetryData.NormSuspensionTravelFr === 1 ||
                                  telemetryData.NormSuspensionTravelRl === 1 ||
                                  telemetryData.NormSuspensionTravelRr === 1;
                        break;
                    case 2: // Circle 3: none (no activation)
                        isActive = false;
                        break;
                    case 3: // Circle 4: any wheel off ground (indicated by any wheel's combinedSlip == 0)
                        isActive = telemetryData.TireCombinedSlipFl === 0 ||
                                  telemetryData.TireCombinedSlipFr === 0 ||
                                  telemetryData.TireCombinedSlipRl === 0 ||
                                  telemetryData.TireCombinedSlipRr === 0;
                        break;
                    case 4: // Circle 5: any wheel loss of traction (indicated by any wheels combinedSlip >= maxSlipRatio)
                        const maxSlipRatio = 2; // Value from tire.js
                        isActive = telemetryData.TireCombinedSlipFl >= maxSlipRatio ||
                                  telemetryData.TireCombinedSlipFr >= maxSlipRatio ||
                                  telemetryData.TireCombinedSlipRl >= maxSlipRatio ||
                                  telemetryData.TireCombinedSlipRr >= maxSlipRatio;
                        break;
                    case 5: // Circle 6: none (no activation)
                        isActive = false;
                        break;
                    case 6: // Circle 7: handbrake (any value above 0 from Handbrake telemetry)
                        isActive = telemetryData.Handbrake > 0;
                        break;
                    case 7: // Circle 8: none (no activation)
                        isActive = false;
                        break;
                }
            }

            // Draw the circle
            indicatorCirclesGroup.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", circleRadius)
                .attr("fill", "none")
                .attr("stroke", rpmDial.indicatorCircles.strokeColor)
                .attr("stroke-width", rpmDial.indicatorCircles.strokeWidth);

            // Create a group for this indicator's SVG content
            const svgContentGroup = indicatorCirclesGroup.append("g")
                .attr("transform", `translate(${x}, ${y})`)
                .attr("class", "indicator-svg-content")
                .attr("data-indicator-index", i);

            // Add SVG content inside the circle based on the indicator index
            // Determine which SVG to use for this indicator
            let svgType;
            switch(i) {
                case 0: // Circle 1: none
                    svgType = "none";
                    break;
                case 1: // Circle 2: suspension bottom out
                    svgType = "suspension";
                    break;
                case 2: // Circle 3: none
                    svgType = "none";
                    break;
                case 3: // Circle 4: wheel off ground
                    svgType = "off-ground";
                    break;
                case 4: // Circle 5: wheel loss of traction
                    svgType = "slip";
                    break;
                case 5: // Circle 6: none
                    svgType = "none";
                    break;
                case 6: // Circle 7: handbrake
                    svgType = "handbrake";
                    break;
                case 7: // Circle 8: none
                    svgType = "none";
                    break;
            }

            // Get the cached SVG
            const cachedSvg = getCachedAlertSvg(svgType);

            if (cachedSvg) {
                // Extract the SVG element from the cached data
                const svgNode = cachedSvg.documentElement;

                // Get the original viewBox to maintain aspect ratio
                const viewBox = svgNode.getAttribute("viewBox");
                const [, , originalWidth, originalHeight] = viewBox.split(" ").map(Number);

                // Calculate scaling factor to fit inside the circle
                const maxDimension = circleRadius * 1.5; // Leave some padding
                const scale = maxDimension / Math.max(originalWidth, originalHeight);

                // Apply the fill color based on activation state
                const paths = svgNode.querySelectorAll("path");
                paths.forEach(path => {
                    path.setAttribute("fill", isActive ? rpmDial.indicatorCircles.activeFill : rpmDial.indicatorCircles.defaultFill);
                });

                // Calculate the center offset based on the original dimensions and scale
                // Apply scale first, then translation to ensure proper centering
                const svgGroup = svgContentGroup.append("g")
                    .attr("transform", `scale(${scale}) translate(${-originalWidth / 2}, ${-originalHeight / 2})`);

                // Append all child nodes from the loaded SVG
                Array.from(svgNode.childNodes).forEach(childNode => {
                    if (childNode.nodeType === 1) { // Element node
                        svgGroup.node().appendChild(childNode.cloneNode(true));
                    }
                });
            } else {
                // If SVG is not cached yet (should not happen if preloaded correctly),
                // show a simple placeholder
                svgContentGroup.append("circle")
                    .attr("r", 10)
                    .attr("fill", isActive ? rpmDial.indicatorCircles.activeFill : rpmDial.indicatorCircles.defaultFill);
            }
        }

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
