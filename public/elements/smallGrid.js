/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        smallGrid.js: 
          Creates and manages the small sub-grid layouts
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

import { renderTire } from './tire.js';
import { renderSpring } from './spring.js';

/**
 * Creates a small grid inside a grid item
 * @param {HTMLElement} gridItem - The parent grid item to create the small grid in
 */
export function createSmallGrid(gridItem) {
  // Create small grid container
  const smallGridContainer = document.createElement('div');
  smallGridContainer.className = 'small-grid-container';
  gridItem.appendChild(smallGridContainer);

  // Create white background rectangle
  const smallGridBackground = document.createElement('div');
  smallGridBackground.className = 'small-grid-background';
  smallGridContainer.appendChild(smallGridBackground);

  // Create small grid
  const smallGrid = document.createElement('div');
  smallGrid.className = 'small-grid';
  smallGridContainer.appendChild(smallGrid);

  // Create small grid items (2x2)
  for (let i = 0; i < 4; i++) {
    const smallGridItem = document.createElement('div');
    smallGridItem.className = 'small-grid-item';
    smallGridItem.id = `${gridItem.id}-small-grid-item-${i}`;
    smallGrid.appendChild(smallGridItem);

    // Create a flex container for the subgrid content
    const flexContainer = document.createElement('div');
    flexContainer.className = 'flex-container';
    smallGridItem.appendChild(flexContainer);

    // Create SVG container for the left half
    const svgContainer = document.createElement('div');
    svgContainer.className = 'svg-container';
    flexContainer.appendChild(svgContainer);

    // Create header container for the right half
    const headerContainer = document.createElement('div');
    headerContainer.className = 'header-container';
    flexContainer.appendChild(headerContainer);

    // Add cardinality text to the right half
    const cardinalityText = document.createElement('div');
    cardinalityText.className = 'subblock-header';

    // Set cardinality text based on position
    if (gridItem.id === 'grid-item-0') { // Top left grid
      if (i === 0) cardinalityText.textContent = 'Front Left';
      if (i === 1) cardinalityText.textContent = 'Front Right';
      if (i === 2) cardinalityText.textContent = 'Rear Left';
      if (i === 3) cardinalityText.textContent = 'Rear Right';
    } else if (gridItem.id === 'grid-item-2') { // Bottom left grid
      if (i === 0) cardinalityText.textContent = 'Front Left';
      if (i === 1) cardinalityText.textContent = 'Front Right';
      if (i === 2) cardinalityText.textContent = 'Rear Left';
      if (i === 3) cardinalityText.textContent = 'Rear Right';
    }

    headerContainer.appendChild(cardinalityText);

    // Add travel display to the right half for spring subgrids
    if (gridItem.id === 'grid-item-0') {
      // Create travel display container
      const travelContainer = document.createElement('div');
      travelContainer.className = 'travel-container';
      headerContainer.appendChild(travelContainer);

      // Create the title "Travel"
      const title = document.createElement('div');
      title.className = 'large-attribute-title';
      title.textContent = 'Travel';
      travelContainer.appendChild(title);

      // Create a container for the value display
      const valueContainer = document.createElement('div');
      valueContainer.className = 'value-container';
      travelContainer.appendChild(valueContainer);

      // Create the integer part
      const integerPart = document.createElement('div');
      integerPart.className = 'large-attribute-integer';
      integerPart.id = `${smallGridItem.id}-travel-integer`;
      valueContainer.appendChild(integerPart);

      // Create the decimal *point*
      const decimalPoint = document.createElement('div');
      decimalPoint.className = 'large-attribute-decimal';
      decimalPoint.textContent = '.';
      valueContainer.appendChild(decimalPoint);

      // Create the decimal *part*
      const decimalPart = document.createElement('div');
      decimalPart.className = 'large-attribute-decimal';
      decimalPart.id = `${smallGridItem.id}-travel-decimal`;
      valueContainer.appendChild(decimalPart);

      // Create the suffix "CM"
      const suffix = document.createElement('div');
      suffix.className = 'suffix-bottom-left';
      suffix.textContent = 'CM';
      valueContainer.appendChild(suffix);
    }

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svgContainer.appendChild(svg);

    // Add appropriate SVG content based on grid position
    if (gridItem.id === 'grid-item-0') {
      // Top left grid - use spring
      svg.id = `spring-svg-${i}`;
      renderSpring(svg);
    } else if (gridItem.id === 'grid-item-2') {
      // Bottom left grid - use tire
      svg.id = `tire-svg-${i}`;
      renderTire(svg);
    }
  }
}

/**
 * Updates the travel display with new data
 * @param {string} gridItemId - The ID of the grid item containing the travel display
 * @param {number} travelValue - The travel value to display
 */
export function updateTravelDisplay(gridItemId, travelValue) {
  const integerEl = document.getElementById(`${gridItemId}-travel-integer`);
  const decimalEl = document.getElementById(`${gridItemId}-travel-decimal`);

  if (integerEl && decimalEl) {
    const absValue = Math.abs(travelValue) * 100;

    // Format the travel value: X.XX format
    const integerPart = Math.floor(absValue);
    const decimalPart = Math.round((absValue - integerPart) * 100);

    // Format integer part with leading zeros at 40% opacity
    const integerStr = integerPart.toString().padStart(2, '0');
    integerEl.innerHTML = '';

    // Apply 40% opacity to leading zeros
    for (let i = 0; i < integerStr.length; i++) {
      const char = document.createElement('span');
      char.textContent = integerStr[i];

      // If this is a leading zero, set opacity to 40%
      if (i < integerStr.length - 1 && integerStr[i] === '0') {
        char.style.opacity = '0.4';
      }

      integerEl.appendChild(char);
    }

    // Format decimal part with two digits
    decimalEl.textContent = decimalPart.toString().padStart(2, '0');
  }
}
