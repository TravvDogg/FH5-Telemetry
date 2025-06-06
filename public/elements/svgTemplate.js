/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        svgTemplate.js: 
          Template file for creating new SVG visualizations
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

// Check if the SVG element exists in the DOM
const templateSvgElement = document.getElementById("templateSvg");
const templateSvg = templateSvgElement ? d3.select("#templateSvg") : null;

// Configuration object for the SVG component
const template = {
    width: 100,
    height: 150,
    color: "#ccc",
    strokeWidth: 2
};

// These will update based on packet data
let currentValue = 0.5; // Default middle value [0-1]
let isActive = false;   // Example boolean state

/**
 * Initial render function for when the component is loaded directly
 * This is used when the SVG element exists in the DOM on page load
 */
function render() {
    // Only render if the SVG element exists
    if (!templateSvg) return;

    // Clear existing content
    templateSvg.selectAll("*").remove();

    // Example SVG element
    templateSvg.append("rect")
        .attr("x", 10)
        .attr("y", 10)
        .attr("width", template.width)
        .attr("height", template.height)
        .attr("fill", "none")
        .attr("stroke", template.color)
        .attr("stroke-width", template.strokeWidth);
}

// Call render if the SVG element exists in the DOM
if (templateSvg) {
    render();
}

/**
 * Renders a template visualization with dynamic data handling
 * @param {Element} svgElement - The SVG element to render into
 * @param {number|boolean|Object} inputData - Data to visualize (can be number, boolean, or object)
 */
export function renderTemplate(svgElement, inputData) {
    if (svgElement) {
        // Get the SVG element
        const svg = d3.select(svgElement);

        // Get the SVG dimensions
        const svgWidth = parseInt(svg.style("width") || svg.attr("width"));
        const svgHeight = parseInt(svg.style("height") || svg.attr("height"));

        // Create a custom configuration object for this SVG instance
        // This allows the SVG to adapt to different container sizes
        const customTemplate = {
            width: svgWidth * 0.8,
            height: svgHeight * 0.8,
            color: template.color,
            strokeWidth: template.strokeWidth
        };

        svg.selectAll("*").remove();

        // Process input data
        if (inputData !== undefined) {
            // Process numeric data - maps to height and color
            if (typeof inputData === 'number') {
                const normalizedData = (inputData + 1) / 2;

                // Update state variable
                currentValue = normalizedData;

                // Map normalized data to visual properties
                customTemplate.height = customTemplate.height * normalizedData;
                customTemplate.color = normalizedData > 0.7 ? "#ff5555" : 
                                      (normalizedData < 0.3 ? "#55ff55" : "#ccc");
            }

            // Process boolean data
            else if (typeof inputData === 'boolean') {
                // Update state variable
                isActive = inputData;

                customTemplate.color = isActive ? "#ffcc00" : "#666666";
                customTemplate.strokeWidth = isActive ? 4 : 2;
            }

            // Process object data - extract specific properties
            else if (typeof inputData === 'object') {
                if (inputData.value !== undefined) {
                    currentValue = inputData.value;
                    customTemplate.height = customTemplate.height * currentValue;
                }

                if (inputData.isActive !== undefined) {
                    isActive = inputData.isActive;
                    customTemplate.color = isActive ? "#ffcc00" : "#666666";
                }
            }
        }

        // Render SVG elements based on current state

        // Main rectangle
        svg.append("rect")
            .attr("x", (svgWidth - customTemplate.width) / 2)
            .attr("y", (svgHeight - customTemplate.height) / 2)
            .attr("width", customTemplate.width)
            .attr("height", customTemplate.height)
            .attr("fill", isActive ? "rgba(255,255,255,0.1)" : "none")
            .attr("stroke", customTemplate.color)
            .attr("stroke-width", customTemplate.strokeWidth);

        // Indicator bar - height changes based on currentValue
        const indicatorHeight = svgHeight * 0.7 * currentValue;
        svg.append("rect")
            .attr("x", svgWidth * 0.8)
            .attr("y", svgHeight - indicatorHeight)
            .attr("width", svgWidth * 0.1)
            .attr("height", indicatorHeight)
            .attr("fill", customTemplate.color)
            .attr("rx", 2)
            .attr("ry", 2);

        // Value text
        svg.append("text")
            .attr("x", svgWidth / 2)
            .attr("y", svgHeight * 0.4)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", customTemplate.color)
            .attr("font-size", isActive ? "1.2em" : "1em")
            .text((currentValue * 100).toFixed(0) + "%");

        // Status text
        svg.append("text")
            .attr("x", svgWidth / 2)
            .attr("y", svgHeight * 0.6)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", customTemplate.color)
            .attr("font-size", "0.8em")
            .text(isActive ? "ACTIVE" : "INACTIVE");
    }
}
