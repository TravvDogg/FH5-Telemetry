/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        client.js: 
          Simple client implementation that displays raw telemetry data
          from Forza (dev view)
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

;(async function(){
  // Import field definitions from the server
  const module = await import('/fields.js');
  const fields = module.default;

  // Get the container element for telemetry values
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
      max:f.max,
     });
  });

  // Create WebSocket connection to receive telemetry data
  // Port 8765 matches the WS_PORT defined in server.js
  const ws = new WebSocket(`ws://${location.hostname}:8765`);

  // Handle incoming WebSocket messages
  ws.onmessage = e => {
    // Parse the JSON data from the server
    const data = JSON.parse(e.data);

    // Update each UI element with the corresponding telemetry data
    elements.forEach((el, i) => {
      const field = fields[i];
      let v = data[field.name];

      // Skip if no data for this field
      if (v == null) return;

      // Apply transformation (if defined)
      if (field.transform) {
        v = field.transform(v);
      }

      // Handle numeric values differently from boolean/string values
      if (typeof v === 'number') {
        // Display number with 2 decimal places
        el.valEl.textContent = v.toFixed(2);

        // Update the fill bar width based on value's position in min-max range
        const pct = (v - el.min) / (el.max - el.min);
        // Clamp percentage between 0-100%
        el.fillEl.style.width =
          Math.max(0, Math.min(1, pct)) * 100 + '%';
      } else {
        // For boolean or string values, just display as string
        el.valEl.textContent = String(v);
      }
    });
  };
})();
