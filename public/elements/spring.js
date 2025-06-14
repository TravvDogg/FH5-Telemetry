/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        spring.js: 
          Renders a spring visualization that responds to
          suspension data
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

const springSvgElement = document.getElementById("springSvg");
const springSvg = springSvgElement ? d3.select("#springSvg") : null;

/**
 * Renders a spring visualization that responds to suspension travel
 * @param {Element} svgElement - The SVG element to render into
 * @param {number} travelInput - Normalized suspension travel value (0 to 1)
 */
export function renderSpring(svgElement, travelInput) {
    if (svgElement) {
        const customSvg = d3.select(svgElement);

        const svgWidth = parseInt(customSvg.style("width") || customSvg.attr("width"));
        const svgHeight = parseInt(customSvg.style("height") || customSvg.attr("height"));

        // Custom spring object yaya
        const customSpring = {
            x: svgWidth / 2,
            y: svgHeight * 0.1,
            width: 10,
            totalHeight: svgHeight * 0.9,
            minCompression: svgHeight * 0.45,
            maxCompression: svgHeight * 0.9,
            coilCount: 6
        };

        customSvg.selectAll("*").remove();

        // Calculate compression
        let customCompression;
        if (travelInput !== undefined) {
            customCompression = customSpring.minCompression + 
                (customSpring.maxCompression - customSpring.minCompression) * travelInput;

            // Normalise
            customCompression = Math.max(customSpring.minCompression, 
                                Math.min(customSpring.maxCompression, customCompression));
        } else {
            // Default to middle
            customCompression = (customSpring.minCompression + customSpring.maxCompression) / 2;
        }

        // Shock shaft
        customSvg.append("rect")
            .attr("x", customSpring.x - (12/2))
            .attr("y", customSpring.y + customSpring.minCompression - customSpring.minCompression)
            .attr("width", 12)
            .attr("height", customCompression)
            .attr("fill", "none")
            .attr("stroke-width", "2.5")
            .attr("stroke", "var(--color-secondary)");

        // Shock Piston
        customSvg.append("rect")
            .attr("x", customSpring.x - (19/2))
            .attr("y", customSpring.y)
            .attr("width", 19)
            .attr("height", customSpring.totalHeight - customSpring.maxCompression + customSpring.minCompression)
            .attr("fill", "var(--color-secondary)");

        // Generate spring segments
        const springTop = customSpring.y - customSpring.totalHeight + customSpring.maxCompression;
        const springBottom = customSpring.y + customCompression;
        const availableHeight = springBottom - springTop;
        const coilSpacing = availableHeight / customSpring.coilCount;
        const segmentLength = 31;

        let segments = [];
        for (let i = 0; i < customSpring.coilCount; i++) {
            const yStart = springTop + i * coilSpacing;
            const yEnd = springTop + (i + 1) * coilSpacing;
            segments.push({
                x1: customSpring.x + segmentLength / 2,
                y1: yStart,
                x2: customSpring.x - segmentLength / 2,
                y2: yEnd
            });
        }

        // Draw spring segments
        customSvg.selectAll("line.spring")
            .data(segments)
            .enter()
            .append("line")
            .attr("class", "spring")
            .attr("x1", d => d.x1)
            .attr("y1", d => d.y1)
            .attr("x2", d => d.x2)
            .attr("y2", d => d.y2)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", 4)
            .attr("stroke-linecap", "round");

        // min/max lines and text
        // Min
        customSvg.append("line")
            .attr("x1", customSpring.x + 20)
            .attr("x2", customSpring.x + 54)
            .attr("y1", customSpring.y + customSpring.minCompression)
            .attr("y2", customSpring.y + customSpring.minCompression)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", 2);

        customSvg.append("text")
            .attr("x", customSpring.x + 54)
            .attr("y", customSpring.y + customSpring.minCompression - 4)
            .attr("text-anchor", "end")
            .attr("class", "lekton-italic-label")
            .text("min");

        // Max
        customSvg.append("text")
            .attr("text-anchor", "end")
            .text("max")
            .attr("x", customSpring.x + 54)
            .attr("y", customSpring.y + customSpring.maxCompression - 4)
            .attr("class", "lekton-italic-label");

        customSvg.append("line")
            .attr("x1", customSpring.x + 20)
            .attr("x2", customSpring.x + 54)
            .attr("y1", customSpring.y + customSpring.maxCompression)
            .attr("y2", customSpring.y + customSpring.maxCompression)
            .attr("stroke", "var(--color-primary)")
            .attr("stroke-width", 2);
    }
}
