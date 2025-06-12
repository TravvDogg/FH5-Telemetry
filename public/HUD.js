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
import { preloadAlertSvgs } from './elements/alertSvgCache.js';
import { renderRpmDial } from './elements/rpmDial.js';
import { renderBoostGauge } from './elements/boostGauge.js';
import { renderGForceGauge } from './elements/gForceGauge.js';

/**
 * Creates the HUD interface
 * @returns {Object} Object with data storage for telemetry updates
 */
export function createHUD() {
  // Preload SVGs to ensure they're ready when needed
  preloadCarSvgs();
  preloadAlertSvgs();

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
    // Add RPM dial and boost gauge to bottom-right grid item
    else if (i === 3) {
      // Create container for RPM dial and boost gauge
      const dialContainer = document.createElement('div');
      dialContainer.className = 'dial-container';
      gridItem.appendChild(dialContainer);

      // Create SVG element for RPM dial
      const rpmDialSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      rpmDialSvg.setAttribute('width', '100%');
      rpmDialSvg.setAttribute('height', '100%');
      rpmDialSvg.id = 'rpmDialSvg';
      dialContainer.appendChild(rpmDialSvg);

      // Create SVG element for boost gauge
      const boostGaugeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      boostGaugeSvg.setAttribute('width', '100%');
      boostGaugeSvg.setAttribute('height', '100%');
      boostGaugeSvg.id = 'boostGaugeSvg';
      dialContainer.appendChild(boostGaugeSvg);

      // Create SVG element for G-force gauge
      const gForceGaugeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      gForceGaugeSvg.setAttribute('width', '100%');
      gForceGaugeSvg.setAttribute('height', '100%');
      gForceGaugeSvg.id = 'gForceGaugeSvg';
      dialContainer.appendChild(gForceGaugeSvg);

      // Render the RPM dial
      renderRpmDial(rpmDialSvg);

      // Render the boost gauge
      renderBoostGauge(boostGaugeSvg);

      // Render the G-force gauge
      renderGForceGauge(gForceGaugeSvg);
    }
  }

  // Create a button to toggle raw data view
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
    const springFrontLeft = document.getElementById('spring-svg-0');
    if (springFrontLeft) renderSpring(springFrontLeft, 1 - data.NormSuspensionTravelFl);
  }

  if (data.NormSuspensionTravelFr !== undefined) {
    const springFrontRight = document.getElementById('spring-svg-1');
    if (springFrontRight) renderSpring(springFrontRight, 1 - data.NormSuspensionTravelFr);
  }

  if (data.NormSuspensionTravelRl !== undefined) {
    const springRearLeft = document.getElementById('spring-svg-2');
    if (springRearLeft) renderSpring(springRearLeft, 1 - data.NormSuspensionTravelRl);
  }

  if (data.NormSuspensionTravelRr !== undefined) {
    const springRearRight = document.getElementById('spring-svg-3');
    if (springRearRight) renderSpring(springRearRight, 1 - data.NormSuspensionTravelRr);
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
  const hasTireSlipData =  data.TireSlipAngleFl !== undefined || data.TireSlipRatioFl !== undefined ||
                                    data.TireSlipAngleFr !== undefined || data.TireSlipRatioFr !== undefined ||
                                    data.TireSlipAngleRl !== undefined || data.TireSlipRatioRl !== undefined ||
                                    data.TireSlipAngleRr !== undefined || data.TireSlipRatioRr !== undefined;

  if (hasTireSlipData) {
    // Update each tire SVG with the appropriate telemetry data
    const tireFrontLeft = document.getElementById('tire-svg-0');
    if (tireFrontLeft) renderTire(tireFrontLeft, data);

    const tireFrontRight = document.getElementById('tire-svg-1');
    if (tireFrontRight) renderTire(tireFrontRight, data);

    const tireRearLeft = document.getElementById('tire-svg-2');
    if (tireRearLeft) renderTire(tireRearLeft, data);

    const tireRearRight = document.getElementById('tire-svg-3');
    if (tireRearRight) renderTire(tireRearRight, data);
  }

  // Update car SVGs with telemetry data
  updateCarLayout(data);

  // Update RPM dial with telemetry data
  if (data.CurrentEngineRpm !== undefined || data.EngineMaxRpm !== undefined) {
    const rpmDialSvg = document.getElementById('rpmDialSvg');
    const boostGaugeSvg = document.getElementById('boostGaugeSvg');
    const gForceGaugeSvg = document.getElementById('gForceGaugeSvg');

    // Render the RPM dial and get position information
    const rpmDialPosition = rpmDialSvg ? renderRpmDial(rpmDialSvg, data) : null;

    // Render the boost gauge with position information from RPM dial
    // Always render the gauge, even if rpmDialPosition is null
    if (boostGaugeSvg) {
      renderBoostGauge(boostGaugeSvg, data, rpmDialPosition);
    }

    // Render the G-force gauge with position information from RPM dial
    // Always render the gauge, even if rpmDialPosition is null
    if (gForceGaugeSvg) {
      renderGForceGauge(gForceGaugeSvg, data, rpmDialPosition);
    }
  }

  // Update G-force gauge when acceleration data is available
  if (data.AccelerationX !== undefined || data.AccelerationZ !== undefined) {
    const gForceGaugeSvg = document.getElementById('gForceGaugeSvg');
    const rpmDialSvg = document.getElementById('rpmDialSvg');

    // Always update the G-force gauge when acceleration data is available
    if (gForceGaugeSvg) {
      // Try to get position from RPM dial, but render the gauge even if position is not available
      const rpmDialPosition = rpmDialSvg ? renderRpmDial(rpmDialSvg, data) : null;
      renderGForceGauge(gForceGaugeSvg, data, rpmDialPosition);
    }
  }

  // Update boost gauge when boost data is available
  if (data.Boost !== undefined) {
    const boostGaugeSvg = document.getElementById('boostGaugeSvg');
    const rpmDialSvg = document.getElementById('rpmDialSvg');

    // Always update the boost gauge when boost data is available
    if (boostGaugeSvg) {
      // Try to get position from RPM dial, but render the gauge even if position is not available
      const rpmDialPosition = rpmDialSvg ? renderRpmDial(rpmDialSvg, data) : null;
      renderBoostGauge(boostGaugeSvg, data, rpmDialPosition);
    }
  }
}
