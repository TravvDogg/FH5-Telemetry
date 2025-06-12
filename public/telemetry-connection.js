/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        telemetry-connection.js: 
          Establishes and manages the WebSocket
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

/**
 * Establishes a WebSocket connection to receive telemetry data
 * @param {Function} onDataCallback - Callback function that receives the telemetry data
 * @returns {WebSocket} The WebSocket connection object
 */
export function connectToTelemetry(onDataCallback) {
  // Create WebSocket connection
  const ws = new WebSocket(`ws://${location.hostname}:8765`);

  // event handler
  ws.onmessage = e => {
    // Parse JSON
    const data = JSON.parse(e.data);
    // Pass the parsed data to the callback
    onDataCallback(data);
  };

  return ws;
}
