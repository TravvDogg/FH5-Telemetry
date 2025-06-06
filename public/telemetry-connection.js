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
  // Create WebSocket connection to the server using the current hostname
  // Port 8765 matches the WS_PORT defined in server.js
  const ws = new WebSocket(`ws://${location.hostname}:8765`);

  // Set up event handler for incoming messages
  ws.onmessage = e => {
    // Parse the JSON data from the server
    const data = JSON.parse(e.data);
    // Pass the parsed data to the callback function
    onDataCallback(data);
  };

  return ws;
}
