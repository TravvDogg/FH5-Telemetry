/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        numberUtils.js: 
          Utility functions for number formatting
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

/**
 * Formats a number with leading zeros and applies opacity to the leading zeros
 * @param {number} value - The value to format
 * @param {number} digits - The total number of digits
 * @param {boolean} useComma - Whether to add a comma after the first two digits
 * @returns {Array} - Array of objects with text and opacity properties
 */
export function formatNumberWithLeadingZeros(value, digits, useComma = false) {
    // Convert to integer and ensure positive
    const intValue = Math.floor(Math.abs(value));

    // Convert to string and pad with leading zeros
    let valueStr = intValue.toString().padStart(digits, '0');

    // Create array of characters with opacity information
    const result = [];

    for (let i = 0; i < valueStr.length; i++) {
        // If using comma and this is position 2 (after first two digits)
        if (useComma && i === 2) {
            // Get the opacity of the previous digit (leading zero)
            const prevOpacity = (i < valueStr.length - intValue.toString().length) ? 0.4 : 1;
            result.push({
                text: ',',
                opacity: prevOpacity
            });
        }

        // Add the digit
        result.push({
            text: valueStr[i],
            // Check if this is a leading zero
            opacity: (i < valueStr.length - intValue.toString().length) ? 0.4 : 1
        });
    }

    return result;
}

/**
 * Creates a formatted numerical display with styling consistent with spring travel data
 * @param {HTMLElement} container - The container element to render the display into
 * @param {number} value - The value to display
 * @param {number} integerDigits - Number of integer digits to display
 * @param {number} decimalDigits - Number of decimal digits to display
 * @param {string} suffix - Optional suffix to display (e.g., "CM", "KM/H")
 */
export function createFormattedNumberDisplay(container, value, integerDigits, decimalDigits, suffix = '') {
    container.innerHTML = '';

    // Create a container for the value display
    const valueContainer = document.createElement('div');
    valueContainer.className = 'value-container';
    container.appendChild(valueContainer);

    // Integer and decimal parts
    const absoluteValue = Math.abs(value);
    const integerPart = Math.floor(absoluteValue);
    const decimalPart = Math.round((absoluteValue - integerPart) * Math.pow(10, decimalDigits));

    // Integer part
    const integerElement = document.createElement('div');
    integerElement.className = 'large-attribute-integer';
    valueContainer.appendChild(integerElement);

    // Format integer part
    const formattedInteger = formatNumberWithLeadingZeros(integerPart, integerDigits);

    // Character
    formattedInteger.forEach(character => {
        const span = document.createElement('span');
        span.textContent = character.text;
        span.style.opacity = character.opacity;
        integerElement.appendChild(span);
    });

    // Decimal part
    if (decimalDigits > 0) {
        // Decimal Point
        const decimalPointElement = document.createElement('div');
        decimalPointElement.className = 'large-attribute-decimal';
        decimalPointElement.textContent = '.';
        valueContainer.appendChild(decimalPointElement);

        // Decimal part
        const decimalPartElement = document.createElement('div');
        decimalPartElement.className = 'large-attribute-decimal';
        decimalPartElement.textContent = decimalPart.toString().padStart(decimalDigits, '0');
        valueContainer.appendChild(decimalPartElement);
    }

    // Create suffix if provided
    if (suffix) {
        const suffixElement = document.createElement('div');
        suffixElement.className = 'suffix-bottom-right';
        suffixElement.style.opacity = '0.4';
        suffixElement.textContent = suffix;
        valueContainer.appendChild(suffixElement);
    }

    return valueContainer;
}
