/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        telemetry-ui.js: 
          Creates and updates the Dev UI
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

/**
 * Creates the telemetry UI with rows for each data field
 * @param {Array} fields - Array of field definitions from fields.js
 * @returns {Array} Array of UI elements for updating
 */
export function createTelemetryUI(fields) {
  const container = document.getElementById('telemetry_values');
  const elements = [];

  // Build rows in the exact order of the fields array
  fields.forEach((f, i) => {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
      <div class="label">${f.name}</div>
      <div class="bar">
        <div class="fill" id="fill-${i}"></div>
      </div>
      <div class="value" id="value-${i}">—</div>
    `;
    container.appendChild(row);
    elements.push({
      fillEl: document.getElementById(`fill-${i}`),
      valEl: document.getElementById(`value-${i}`),
      min: f.min,
      max: f.max,
    });
  });

  return elements;
}

/**
 * Updates the telemetry UI with new data from the WebSocket
 * @param {Object} data - Telemetry data object received from WebSocket
 * @param {Array} elements - Array of UI elements created by createTelemetryUI
 * @param {Array} fields - Array of field definitions from fields.js
 */
export function updateTelemetryUI(data, elements, fields) {
  // Update UI elements
  elements.forEach((el, i) => {
    const field = fields[i];
    let v = data[field.name];

    if (v == null) return;

    // Apply transformation (optional)
    if (field.transform) {
      v = field.transform(v);
    }

    // Handle numeric values
    if (typeof v === 'number') {
      // Display number with 2 decimal places
      el.valEl.textContent = v.toFixed(2);

      const pct = (v - el.min) / (el.max - el.min);
      // Normalise
      el.fillEl.style.width =
        Math.max(0, Math.min(1, pct)) * 100 + '%';
    } else {
      // For boolean, just display as string
      el.valEl.textContent = String(v);
    }
  });
}
