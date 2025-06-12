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
  // import field definitions from the server
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

  // Create WebSocket connection
  const ws = new WebSocket(`ws://${location.hostname}:8765`);

  // Handle WebSocket messages
  ws.onmessage = e => {
    // Parse the JSON data
    const data = JSON.parse(e.data);

    // Update each UI element with the corresponding telemetry data
    elements.forEach((el, i) => {
      const field = fields[i];
      let v = data[field.name];

      // Skip if no data
      if (v == null) return;

      // Apply transformation
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
  };
})();
