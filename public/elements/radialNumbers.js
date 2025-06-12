/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        radialNumbers.js: 
          Class for displaying numbers in a circle around a dial
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

import { polarToCartesian } from './geometryUtils.js';

/**
 * Class for displaying numbers in a circle around a dial
 */
export class RadialNumbers {
    /**
     * Creates a new RadialNumbers instance
     * @param {Object} config - Configuration parameters
     * @param {number} config.startAngle - Start angle in degrees
     * @param {number} config.endAngle - End angle in degrees
     * @param {number} config.outerRadius - Outer radius of the dial
     * @param {number} config.numberOffset - Distance from outer radius to numbers
     * @param {number} config.outerStrokeWidth - Stroke width of the outer arc
     */
    constructor(config) {
        this.startAngle = config.startAngle;
        this.endAngle = config.endAngle;
        this.outerRadius = config.outerRadius;
        this.numberOffset = config.numberOffset || 8;
        this.outerStrokeWidth = config.outerStrokeWidth || 2;
    }

    /**
     * Renders numbers around a dial
     * @param {Object} svg - D3 selection of SVG element
     * @param {number} centerX - X coordinate of the center point
     * @param {number} centerY - Y coordinate of the center point
     * @param {Array} numbers - Array of numbers to display
     * @param {Object} options - Additional options
     * @param {string} options.cssClass - CSS class for the numbers
     * @param {boolean} options.isDefault - Whether to use default styling
     * @param {boolean} options.rotate180 - Whether to rotate numbers 180 degrees
     */
    renderNumbers(svg, centerX, centerY, numbers, options = {}) {
        const cssClass = options.cssClass || "small-attribute-decimal";
        const isDefault = options.isDefault || false;
        const rotate180 = options.rotate180 || false;

        const numberCount = numbers.length;

        for (let i = 0; i < numberCount; i++) {
            const angle = this.startAngle + (i / (numberCount - 1)) * (this.endAngle - this.startAngle);

            // Calculate position
            const numberRadius = this.outerRadius - this.outerStrokeWidth - this.numberOffset;
            const numberPoint = polarToCartesian(centerX, centerY, numberRadius, angle);

            // Add number
            svg.append("text")
                .attr("x", numberPoint.x)
                .attr("y", numberPoint.y)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("fill", isDefault ? "var(--color-secondary)" : "var(--color-primary)")
                .attr("class", cssClass)
                .attr("transform", `rotate(${rotate180 ? angle + 180 : angle}, ${numberPoint.x}, ${numberPoint.y})`)
                .text(numbers[i]);
        }
    }

}
