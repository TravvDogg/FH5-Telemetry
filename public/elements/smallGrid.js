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
import { formatNumberWithLeadingZeros, createFormattedNumberDisplay } from './numberUtils.js';

/**
 * Creates a small grid inside a grid item
 * @param {HTMLElement} gridItem - The parent grid item to create the small grid in
 */
export function createSmallGrid(gridItem) {
  // Small grid container
  const smallGridContainer = document.createElement('div');
  smallGridContainer.className = 'small-grid-container';
  gridItem.appendChild(smallGridContainer);

  // White background rectangle
  const smallGridBackground = document.createElement('div');
  smallGridBackground.className = 'small-grid-background';
  smallGridContainer.appendChild(smallGridBackground);

  // Small grid
  const smallGrid = document.createElement('div');
  smallGrid.className = 'small-grid';
  smallGridContainer.appendChild(smallGrid);

  // Small grid items (2x2)
  for (let i = 0; i < 4; i++) {
    const smallGridItem = document.createElement('div');
    smallGridItem.className = 'small-grid-item';
    smallGridItem.id = `${gridItem.id}-small-grid-item-${i}`;
    smallGrid.appendChild(smallGridItem);

    // Flex container
    const flexContainer = document.createElement('div');
    flexContainer.className = 'flex-container';
    smallGridItem.appendChild(flexContainer);

    // SVG container
    const svgContainer = document.createElement('div');
    svgContainer.className = 'svg-container';
    flexContainer.appendChild(svgContainer);

    // Header container
    const headerContainer = document.createElement('div');
    headerContainer.className = 'header-container';
    flexContainer.appendChild(headerContainer);

    // Cardinality text
    const cardinalityText = document.createElement('div');
    cardinalityText.className = 'subblock-header';

    // cardinality text
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

    if (gridItem.id === 'grid-item-0') {
      const travelContainer = document.createElement('div');
      travelContainer.className = 'travel-container';
      headerContainer.appendChild(travelContainer);

      const title = document.createElement('div');
      title.className = 'large-attribute-title';
      title.textContent = 'TRAVEL';
      travelContainer.appendChild(title);

      createFormattedNumberDisplay(travelContainer, 0, 2, 2, 'CM');
    }

    // SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svgContainer.appendChild(svg);

    // SVG content based on grid
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
  const travelContainer = document.querySelector(`#${gridItemId} .travel-container`);

  if (travelContainer) {
    // Convert travel value to centimeters (multiply by 100)
    const travelValueInCm = travelValue * 100;

    // Find the value container or create a new one if it doesn't exist
    let valueContainer = travelContainer.querySelector('.value-container');
    if (valueContainer) {
      valueContainer.remove();
    }

    // Create formatted number display with 2 integer digits, 2 decimal digits, and "CM" suffix
    createFormattedNumberDisplay(travelContainer, travelValueInCm, 2, 2, 'CM');
  }
}
