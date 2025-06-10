/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        carLayout.js: 
          Creates and manages the car visualization layout
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

import { rendercarFront as renderCarFront } from './car/carFront.js';
import { rendercarSide as renderCarSide } from './car/carSide.js';
import { rendercarTop as renderCarTop } from './car/carTop.js';

/**
 * Creates the car layout in the top-right grid item
 * @param {HTMLElement} gridItem - The grid item to create the car layout in
 */
export function createCarLayout(gridItem) {
  // Create a container for the car layout
  const carLayoutContainer = document.createElement('div');
  carLayoutContainer.className = 'car-layout-container';
  gridItem.appendChild(carLayoutContainer);

  // Create left side container (will be split vertically)
  const leftContainer = document.createElement('div');
  leftContainer.className = 'car-left-container';
  carLayoutContainer.appendChild(leftContainer);

  // Create right side container (for carTop)
  const rightContainer = document.createElement('div');
  rightContainer.className = 'car-right-container';
  carLayoutContainer.appendChild(rightContainer);

  // Create top half of left container (for carFront)
  const topHalfContainer = document.createElement('div');
  topHalfContainer.className = 'car-top-half-container';
  leftContainer.appendChild(topHalfContainer);

  // Create bottom half of left container (for carSide)
  const bottomHalfContainer = document.createElement('div');
  bottomHalfContainer.className = 'car-bottom-half-container';
  leftContainer.appendChild(bottomHalfContainer);

  // Create SVG elements for each view
  // carFront SVG (top half of left side)
  const carFrontSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  carFrontSvg.setAttribute('width', '100%');
  carFrontSvg.setAttribute('height', '100%');
  carFrontSvg.id = 'carFront-svg';
  topHalfContainer.appendChild(carFrontSvg);
  renderCarFront(carFrontSvg);

  // carSide SVG (bottom half of left side)
  const carSideSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  carSideSvg.setAttribute('width', '100%');
  carSideSvg.setAttribute('height', '100%');
  carSideSvg.id = 'carSide-svg';
  bottomHalfContainer.appendChild(carSideSvg);
  renderCarSide(carSideSvg);

  // carTop SVG (right side)
  const carTopSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  carTopSvg.setAttribute('width', '100%');
  carTopSvg.setAttribute('height', '100%');
  carTopSvg.id = 'carTop-svg';
  rightContainer.appendChild(carTopSvg);
  renderCarTop(carTopSvg);
}

/**
 * Updates car SVGs with telemetry data
 * @param {Object} data - Telemetry data
 */
export function updateCarLayout(data) {
  // Only update if we have the necessary telemetry data
  if (data.AccelerationZ !== undefined || data.AngularVelocityX !== undefined) {
    const carSideSvg = document.getElementById('carSide-svg');
    if (carSideSvg) renderCarSide(carSideSvg, data);
  }

  if (data.AngularVelocityZ !== undefined) {
    const carFrontSvg = document.getElementById('carFront-svg');
    if (carFrontSvg) renderCarFront(carFrontSvg, data);
  }

  if (data.AngularVelocityY !== undefined) {
    const carTopSvg = document.getElementById('carTop-svg');
    if (carTopSvg) renderCarTop(carTopSvg, data);
  }
}
