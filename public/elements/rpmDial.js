/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        rpmDial.js: 
          Renders an RPM dial visualization
          Probably too long for one script
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

import { formatNumberWithLeadingZeros } from './numberUtils.js';
import { RadialNumbers } from './radialNumbers.js';
import { polarToCartesian } from './geometryUtils.js';
import { getCachedAlertSvg } from './alertSvgCache.js';
import { tire } from './tire.js';

const rpmDialSvgElement = document.getElementById("rpmDialSvg");
const rpmDialSvg = rpmDialSvgElement ? d3.select("#rpmDialSvg") : null;

const arcSpaceDegrees = 90;
const arcStartDegrees = (-180 + (arcSpaceDegrees / 2));
const arcEndDegrees = (90 + (arcSpaceDegrees / 2));
const rpmDial = {
    outerRadius: 143,      // Radius of the outer arc
    innerRadius: 95,       // Radius of the inner arc
    outerStrokeWidth: 2,   // Stroke width of the outer arc
    innerStrokeWidth: 1,   // Stroke width of the inner arc
    startAngle: arcStartDegrees,
    endAngle: arcEndDegrees,
    numberOffset: 8,       // Distance from inner arc to numbers in px
    numberStartAngle: arcStartDegrees + 5,
    numberEndAngle: arcEndDegrees - 5,
    gearCircleRadius: 30,  // Radius of the gear indication circle
    gearCircleStrokeWidth: 4, // Stroke width of the gear indication circle
    yOffset: 12,           // Vertical offset to raise the dial (except speed and "KMH")

    // brake, throttle, and steering arcs
    brakeThrottleArcAngle: 55,  // Angle of the brake and throttle arcs in degrees
    steeringArcAngle: 90,       // Angle of the steering arc in degrees
    controlArcOuterRadius: 155, // Outer radius of the control arcs
    controlArcInnerRadius: 148,  // Inner radius of the control arcs
    controlArcStrokeWidth: 1,   // Stroke width of the control arcs

    // indicator circles
    indicatorCircles: {
        count: 8,              // Number of indicator circles
        radius: 17,            // Radius of each indicator circle
        strokeWidth: 2,        // Stroke width of each indicator circle
        strokeColor: "white",  // Stroke color of each indicator circle
        defaultFill: "var(--color-primary)",  // Default fill color
        activeFill: "var(--color-warning-activation)"  // Fill color when activated
    },

    // Colors for control arcs
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

        const svgWidth = parseInt(svg.style("width") || svg.attr("width"));
        const svgHeight = parseInt(svg.style("height") || svg.attr("height"));

        const centerX = svgWidth / 2;
        const centerY = svgHeight - rpmDial.outerRadius;

        // Create a separate centerY for the dial
        const dialCenterY = centerY - rpmDial.yOffset;

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

        // Outer arc
        svg.append("path")
            .attr("d", outerArc)
            .attr("transform", `translate(${centerX}, ${dialCenterY})`)
            .attr("fill", "none")
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", rpmDial.outerStrokeWidth);

        // Inner arc
        svg.append("path")
            .attr("d", innerArc)
            .attr("transform", `translate(${centerX}, ${dialCenterY})`)
            .attr("fill", "none")
            .attr("stroke", "var(--color-secondary)")
            .attr("stroke-width", rpmDial.innerStrokeWidth);

        // Connecting lines
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

        // RPM numbers
        let engineMaxRpm = 10000;
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

        // Render numbers
        radialNumbers.renderNumbers(svg, centerX, dialCenterY, numbers, {
            cssClass: "small-attribute-decimal",
            isDefault: false
        });

        // Current RPM
        const currentRpm = (telemetryData && telemetryData.CurrentEngineRpm !== undefined) 
            ? telemetryData.CurrentEngineRpm 
            : 0;

        // Calculate the ratio based on the current RPM and max RPM
        const rpmRatio = currentRpm / (maxRpmThousands * 1000);
        const indicatorAngle = rpmDial.startAngle + rpmRatio * (rpmDial.endAngle - rpmDial.startAngle);

        // Conic gradient from start to needle position
        const gradientId = "rpmDialGradient";
        const clipPathId = "rpmDialClipPath";

        // defs section for gradient and clip path
        const defs = svg.append("defs");

        // Clip path for the arc section
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

        // Conic gradient
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

        const gradientCircle = svg.append("circle")
            .attr("cx", centerX)
            .attr("cy", dialCenterY)
            .attr("r", rpmDial.outerRadius)
            .attr("fill", `url(#${gradientId})`)
            .attr("clip-path", `url(#${clipPathId})`)
            .attr("stroke", "none");

        // Indicator line
        const indicatorInnerPoint = polarToCartesian(centerX, dialCenterY, rpmDial.innerRadius, indicatorAngle);
        const indicatorOuterPoint = polarToCartesian(centerX, dialCenterY, rpmDial.outerRadius, indicatorAngle);

        svg.append("line")
            .attr("x1", indicatorInnerPoint.x)
            .attr("y1", indicatorInnerPoint.y)
            .attr("x2", indicatorOuterPoint.x)
            .attr("y2", indicatorOuterPoint.y)
            .attr("stroke", "var(--color-rpm-indicator)")
            .attr("stroke-width", 2);

        // Add gear indication circle
        svg.append("circle")
            .attr("cx", centerX)
            .attr("cy", dialCenterY)
            .attr("r", rpmDial.gearCircleRadius)
            .attr("fill", "none")
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", rpmDial.gearCircleStrokeWidth)
            .attr("stroke-location", "inside");

        // Gear text
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

        // Warning indicators
        const circleRadius = rpmDial.indicatorCircles.radius;
        const circleCount = rpmDial.indicatorCircles.count;
        const circleDistance = (rpmDial.innerRadius - rpmDial.gearCircleRadius - circleRadius * 2) / 2;
        const circleOrbitRadius = rpmDial.gearCircleRadius + circleDistance + circleRadius;

        const indicatorCirclesGroup = svg.append("g")
            .attr("transform", `translate(${centerX}, ${dialCenterY})`)
            .attr("id", "indicator-circles-group");

        // Calculate angular offset to prevent circles from spilling over edges
        const circleRadiusAngle = Math.atan2(circleRadius, circleOrbitRadius) * (180 / Math.PI);

        // Adjust start and end angles
        const adjustedStartAngle = rpmDial.startAngle + circleRadiusAngle;
        const adjustedEndAngle = rpmDial.endAngle - circleRadiusAngle;

        // Effective angle range for positioning the circles
        const effectiveAngleRange = adjustedEndAngle - adjustedStartAngle;

        // Draw each indicator circle
        for (let i = 0; i < circleCount; i++) {
            let angle;
            if (circleCount === 1) {
                angle = (adjustedStartAngle + effectiveAngleRange / 2) * (Math.PI / 180);
            } else {
                angle = (adjustedStartAngle + (i * (effectiveAngleRange / (circleCount - 1)))) * (Math.PI / 180);
            }

            // Calculate position
            const x = Math.sin(angle) * circleOrbitRadius;
            const y = -Math.cos(angle) * circleOrbitRadius;

            let isActive = false; // Default

            // Activation logic
            if (telemetryData) {
                switch(i) {
                    case 0:
                        isActive = false;
                        break;
                    case 1: // Circle 2: suspension bottom out (any suspensiontravelnorm at 1)
                        isActive = telemetryData.NormSuspensionTravelFl === 1 ||
                                  telemetryData.NormSuspensionTravelFr === 1 ||
                                  telemetryData.NormSuspensionTravelRl === 1 ||
                                  telemetryData.NormSuspensionTravelRr === 1;
                        break;
                    case 2:
                        isActive = false;
                        break;
                    case 3: // Circle 4: wheel off ground (any combinedSlip == 0)
                        isActive = telemetryData.TireCombinedSlipFl === 0 ||
                                  telemetryData.TireCombinedSlipFr === 0 ||
                                  telemetryData.TireCombinedSlipRl === 0 ||
                                  telemetryData.TireCombinedSlipRr === 0;
                        break;
                    case 4: // Circle 5: loss of traction (any combinedSlip >= maxSlipRatio)
                        const maxSlipRatio = tire.maxSlipRatio;
                        isActive = telemetryData.TireCombinedSlipFl >= maxSlipRatio ||
                                  telemetryData.TireCombinedSlipFr >= maxSlipRatio ||
                                  telemetryData.TireCombinedSlipRl >= maxSlipRatio ||
                                  telemetryData.TireCombinedSlipRr >= maxSlipRatio;
                        break;
                    case 5:
                        isActive = false;
                        break;
                    case 6: // Circle 7: handbrake (any value above 0 for Handbrake)
                        isActive = telemetryData.Handbrake > 0;
                        break;
                    case 7:
                        isActive = false;
                        break;
                }
            }

            // draw Circle
            indicatorCirclesGroup.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", circleRadius)
                .attr("fill", "none")
                .attr("stroke", rpmDial.indicatorCircles.strokeColor)
                .attr("stroke-width", rpmDial.indicatorCircles.strokeWidth);

            // Group for this indicator's SVG content
            const svgContentGroup = indicatorCirclesGroup.append("g")
                .attr("transform", `translate(${x}, ${y})`)
                .attr("class", "indicator-svg-content")
                .attr("data-indicator-index", i);

            // Add SVG content inside the circle based on the indicator index
            let svgType;
            switch(i) {
                case 0:
                    svgType = "none";
                    break;
                case 1: // Circle 2: suspension bottom out
                    svgType = "suspension";
                    break;
                case 2:
                    svgType = "none";
                    break;
                case 3: // Circle 4: wheel off ground
                    svgType = "off-ground";
                    break;
                case 4: // Circle 5: wheel loss of traction
                    svgType = "slip";
                    break;
                case 5:
                    svgType = "none";
                    break;
                case 6: // Circle 7: handbrake
                    svgType = "handbrake";
                    break;
                case 7:
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
                // Apply scale first, then translation
                const svgGroup = svgContentGroup.append("g")
                    .attr("transform", `scale(${scale}) translate(${-originalWidth / 2}, ${-originalHeight / 2})`);

                // Append all child nodes from the loaded SVG
                Array.from(svgNode.childNodes).forEach(childNode => {
                    if (childNode.nodeType === 1) { // Element node
                        svgGroup.node().appendChild(childNode.cloneNode(true));
                    }
                });
            } else {
                svgContentGroup.append("circle")
                    .attr("r", 10)
                    .attr("fill", isActive ? rpmDial.indicatorCircles.activeFill : rpmDial.indicatorCircles.defaultFill);
            }
        }

        // Add "RPM" text
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

        // RPM value
        const rpmValue = (telemetryData && telemetryData.CurrentEngineRpm !== undefined) 
            ? Math.floor(telemetryData.CurrentEngineRpm) 
            : 0;

        const isDefaultRpm = !(telemetryData && telemetryData.CurrentEngineRpm !== undefined);
        const formattedRpm = formatNumberWithLeadingZeros(rpmValue, 5, true);

        // Create a container for the RPM value
        const rpmContainer = svg.append("g")
            .attr("transform", `translate(${centerX}, ${dialCenterY + rpmDial.gearCircleRadius + 20})`);

        // Calculate total width for centering
        let totalWidth = 0;
        formattedRpm.forEach(char => {
            // Use less space for comma
            totalWidth += (char.text === ',') ? 4 : 8;
        });

        // Center text
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

            // Use less space for comma
            xOffset += (char.text === ',') ? 5 : 8;
        });

        // Speed display at the bottom of the circle
        const speedValue = (telemetryData && telemetryData.Speed !== undefined) 
            ? Math.floor(Math.abs(telemetryData.Speed * 3.6)) 
            : 0;

        const isDefaultSpeed = !(telemetryData && telemetryData.Speed !== undefined);
        const formattedSpeed = formatNumberWithLeadingZeros(speedValue, 3);

        // Create a container for speed value
        const speedContainer = svg.append("g")
            .attr("transform", `translate(${centerX}, ${centerY})`);

        // Add each character
        xOffset = (-formattedSpeed.length * 25) + 25;

        formattedSpeed.forEach(char => {
            speedContainer.append("text")
                .attr("x", xOffset)
                .attr("y", rpmDial.outerRadius - 8)
                .attr("text-anchor", "middle")
                .attr("class", "speed")
                .attr("style", "font-family: 'Lekton', monospace;")
                .attr("fill", "var(--color-primary)")
                .attr("opacity", char.opacity)
                .text(char.text);

            xOffset += 50;
        });

        // "KM/H" text next to numbers
        speedContainer.append("text")
            .attr("x", xOffset - 25)
            .attr("y", rpmDial.outerRadius - 18)
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "middle")
            .attr("class", "suffix-bottom-right")
            .attr("fill", "var(--color-primary-40)")
            .text("KM/H");

        // Calculate angles for the brake arc
        const brakeStartAngle = rpmDial.startAngle;
        const brakeEndAngle = brakeStartAngle + rpmDial.brakeThrottleArcAngle;

        // Brake arc
        const brakeArc = d3.arc()
            .innerRadius(rpmDial.controlArcInnerRadius)
            .outerRadius(rpmDial.controlArcOuterRadius)
            .startAngle(brakeStartAngle * (Math.PI / 180))
            .endAngle(brakeEndAngle * (Math.PI / 180));

        // Brake arc outline
        svg.append("path")
            .attr("d", brakeArc)
            .attr("transform", `translate(${centerX}, ${dialCenterY})`)
            .attr("fill", "none")
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", rpmDial.controlArcStrokeWidth);

        // "BRK" text (brake)
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

        // Brake input indicator arc
        const brakeValue = (telemetryData && telemetryData.Brake !== undefined) 
            ? telemetryData.Brake 
            : 0;

        const isDefaultBrake = !(telemetryData && telemetryData.Brake !== undefined);
        const brakeRatio = -brakeValue / 255;

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

        // Calculate angles for the throttle arc
        const throttleStartAngle = rpmDial.endAngle;
        const throttleEndAngle = throttleStartAngle - rpmDial.brakeThrottleArcAngle;

        // Throttle arc
        const throttleArc = d3.arc()
            .innerRadius(rpmDial.controlArcInnerRadius)
            .outerRadius(rpmDial.controlArcOuterRadius)
            .startAngle(throttleStartAngle * (Math.PI / 180))
            .endAngle(throttleEndAngle * (Math.PI / 180));

        // Throttle arc outline
        svg.append("path")
            .attr("d", throttleArc)
            .attr("transform", `translate(${centerX}, ${dialCenterY})`)
            .attr("fill", "none")
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", rpmDial.controlArcStrokeWidth);

        // "THR" text (throttle)
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

        // Throttle input indicator arc
        const throttleValue = (telemetryData && telemetryData.Throttle !== undefined) 
            ? -telemetryData.Throttle 
            : 0;

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

        // Calculate angles for steering arc
        const steeringCenterAngle = 0;
        const steeringStartAngle = steeringCenterAngle - (rpmDial.steeringArcAngle / 2);
        const steeringEndAngle = steeringCenterAngle + (rpmDial.steeringArcAngle / 2);

        // Steering arc generator
        const steeringArc = d3.arc()
            .innerRadius(rpmDial.controlArcInnerRadius)
            .outerRadius(rpmDial.controlArcOuterRadius)
            .startAngle(steeringStartAngle * (Math.PI / 180))
            .endAngle(steeringEndAngle * (Math.PI / 180));

        // Steering arc outline
        svg.append("path")
            .attr("d", steeringArc)
            .attr("transform", `translate(${centerX}, ${dialCenterY})`)
            .attr("fill", "none")
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", rpmDial.controlArcStrokeWidth);

        // Vertical line in middle of the steering arc
        const lineStartPoint = polarToCartesian(centerX, dialCenterY, rpmDial.controlArcInnerRadius, steeringCenterAngle);
        const lineEndPoint = polarToCartesian(centerX, dialCenterY, rpmDial.controlArcInnerRadius + 2, steeringCenterAngle);

        svg.append("line")
            .attr("x1", centerX)
            .attr("y1", dialCenterY - rpmDial.controlArcOuterRadius)
            .attr("x2", centerX)
            .attr("y2", dialCenterY - rpmDial.controlArcOuterRadius + 2)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", 1);

        // "STR" text
        const steeringTextPoint = polarToCartesian(centerX, dialCenterY, rpmDial.controlArcOuterRadius + 10, steeringCenterAngle);
        svg.append("text")
            .attr("x", steeringTextPoint.x)
            .attr("y", steeringTextPoint.y + 3)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", "var(--color-primary)")
            .attr("class", "small-attribute-title-2")
            .text("STR");

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
            // Steering right (positive)
            filledSteeringStartAngle = steeringCenterAngle;
            filledSteeringEndAngle = steeringCenterAngle + (steerRatio * steeringArcSize);
        } else {
            // Steering left (negative)
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
            .attr("opacity", isDefaultSteer ? 0.5 : 1)
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
