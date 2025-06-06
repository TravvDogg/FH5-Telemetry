/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        main.js: 
          Main entry point that coordinates the telemetry UI, connection,
          and HUD modules
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

// Import modules
import { createTelemetryUI, updateTelemetryUI } from './telemetry-ui.js';
import { connectToTelemetry } from './telemetry-connection.js';
import { createHUD, updateHUD } from './HUD.js';

// Self-executing async function to initialize the application
;(async function() {
  // Fetch the field definitions from the server
  const module = await import('/fields.js');
  const fields = module.default;

  // Create the telemetry UI
  const telemetryElements = createTelemetryUI(fields);

  // Create the HUD
  const hudElements = createHUD();

  // Connect to the telemetry WebSocket and handle incoming data
  connectToTelemetry(data => {
    // Update the telemetry UI
    updateTelemetryUI(data, telemetryElements, fields);

    // Update the HUD
    updateHUD(data, hudElements);
  });
})();
