/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        geometryUtils.js: 
          Utility functions for geometric calculations
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

/**
 * Converts polar coordinates to Cartesian coordinates
 * @param {number} centerX - X coordinate of the center point
 * @param {number} centerY - Y coordinate of the center point
 * @param {number} radius - Radius
 * @param {number} angleInDegrees - Angle in degrees
 * @returns {Object} - {x, y} coordinates
 */
export function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = angleInDegrees * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.sin(angleInRadians)),
        y: centerY - (radius * Math.cos(angleInRadians))
    };
}