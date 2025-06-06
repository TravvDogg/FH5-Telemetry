/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        HUD.js: 
          Main module for creating and updating the HUD
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

import { createSmallGrid, updateTravelDisplay } from './elements/smallGrid.js';
import { createCarLayout, updateCarLayout } from './elements/carLayout.js';
import { renderTire } from './elements/tire.js';
import { renderSpring } from './elements/spring.js';
import { preloadCarSvgs } from './elements/car/carSvgCache.js';

/**
 * Creates the HUD interface
 * @returns {Object} Object with data storage for telemetry updates
 */
export function createHUD() {
  // Preload car SVGs to ensure they're ready when needed
  preloadCarSvgs();

  const hudContainer = document.getElementById('HUD');

  // Create the grid container
  const gridContainer = document.createElement('div');
  gridContainer.className = 'grid-container';
  hudContainer.appendChild(gridContainer);

  // Create the grid items
  for (let i = 0; i < 4; i++) {
    const gridItem = document.createElement('div');
    gridItem.className = 'grid-item';
    gridItem.id = `grid-item-${i}`;
    gridContainer.appendChild(gridItem);

    // Add small grid to top-left and bottom-left grid items
    if (i === 0 || i === 2) {
      createSmallGrid(gridItem);
    }
    // Add car layout to top-right grid item
    else if (i === 1) {
      createCarLayout(gridItem);
    }
  }

  // Create a button to raw data view
  const devButton = document.createElement('button');
  devButton.id = 'dev-button';
  devButton.textContent = 'Developer View';
  hudContainer.appendChild(devButton);

  // Add event listener to toggle dev view
  devButton.addEventListener('click', () => {
    const telemetryContainer = document.getElementById('telemetry_values');
    if (telemetryContainer.style.display === 'none') {
      telemetryContainer.style.display = 'block';
    } else {
      telemetryContainer.style.display = 'none';
    }
  });

  // Initially hide the raw data
  const telemetryContainer = document.getElementById('telemetry_values');
  telemetryContainer.style.display = 'none';

  // Return an object with data storage for telemetry updates
  return {
    data: {} // Store the latest telemetry data
  };
}

/**
 * Updates the HUD with new telemetry data
 * @param {Object} data - The telemetry data
 * @param {Object} hudElements - The HUD elements object returned by createHUD
 */
export function updateHUD(data, hudElements) {
  // Store the latest telemetry data
  hudElements.data = { ...hudElements.data, ...data };

  // Update the springs with the latest suspension travel data
  if (data.NormSuspensionTravelFl !== undefined) {
    const springFl = document.getElementById('spring-svg-0');
    if (springFl) renderSpring(springFl, 1 - data.NormSuspensionTravelFl);
  }

  if (data.NormSuspensionTravelFr !== undefined) {
    const springFr = document.getElementById('spring-svg-1');
    if (springFr) renderSpring(springFr, 1 - data.NormSuspensionTravelFr);
  }

  if (data.NormSuspensionTravelRl !== undefined) {
    const springRl = document.getElementById('spring-svg-2');
    if (springRl) renderSpring(springRl, 1 - data.NormSuspensionTravelRl);
  }

  if (data.NormSuspensionTravelRr !== undefined) {
    const springRr = document.getElementById('spring-svg-3');
    if (springRr) renderSpring(springRr, 1 - data.NormSuspensionTravelRr);
  }

  // Update the travel displays with the latest suspension travel data
  if (data.SuspensionTravelMetersFl !== undefined) {
    updateTravelDisplay('grid-item-0-small-grid-item-0', data.SuspensionTravelMetersFl);
  }

  if (data.SuspensionTravelMetersFr !== undefined) {
    updateTravelDisplay('grid-item-0-small-grid-item-1', data.SuspensionTravelMetersFr);
  }

  if (data.SuspensionTravelMetersRl !== undefined) {
    updateTravelDisplay('grid-item-0-small-grid-item-2', data.SuspensionTravelMetersRl);
  }

  if (data.SuspensionTravelMetersRr !== undefined) {
    updateTravelDisplay('grid-item-0-small-grid-item-3', data.SuspensionTravelMetersRr);
  }

  // Update tire SVGs with the latest tire slip data
  // Check if any of the tire slip data is available
  const hasTireSlipData = data.TireSlipAngleFl !== undefined || data.TireSlipRatioFl !== undefined ||
                          data.TireSlipAngleFr !== undefined || data.TireSlipRatioFr !== undefined ||
                          data.TireSlipAngleRl !== undefined || data.TireSlipRatioRl !== undefined ||
                          data.TireSlipAngleRr !== undefined || data.TireSlipRatioRr !== undefined;

  if (hasTireSlipData) {
    // Update each tire SVG with the appropriate telemetry data
    const tireFl = document.getElementById('tire-svg-0');
    if (tireFl) renderTire(tireFl, data);

    const tireFr = document.getElementById('tire-svg-1');
    if (tireFr) renderTire(tireFr, data);

    const tireRl = document.getElementById('tire-svg-2');
    if (tireRl) renderTire(tireRl, data);

    const tireRr = document.getElementById('tire-svg-3');
    if (tireRr) renderTire(tireRr, data);
  }

  // Update car SVGs with telemetry data
  updateCarLayout(data);
}
