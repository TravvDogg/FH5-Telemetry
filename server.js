/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        server.js: 
          Main server that receives UDP telemetry data from Forza
          and broadcasts it to clients via WebSocket
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import os from 'os';

// Set up __dirname equivalent in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create a require function to use CommonJS modules in ES modules
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import required modules
const dgram     = require('dgram');
const http      = require('http');
const fs        = require('fs');
const WebSocket = require('ws');

// Server configuration
const UDP_PORT  = 1555;  // Port to receive telemetry data from Forza
const HTTP_PORT = 8000;  // Port for the web server
const WS_PORT   = 8765;  // Port for WebSocket server
const publicDir = path.join(__dirname, 'public');

// Import field definitions from fields.js
const fieldsURL = pathToFileURL(path.join(__dirname, 'public', 'fields.js')).href;
const { default: fields } = await import(fieldsURL);


// Reader functions for parsing binary data from UDP packets
// Each function takes a buffer and an offset and returns the appropriate data type
const readers = {
  Boolean:      (buf, off) => buf.readFloatLE(off) > 0,  // Convert float to boolean
  readFloatLE:  (buf, off) => buf.readFloatLE(off),      // Read 32-bit float
  readUInt8:    (buf, off) => buf.readUInt8(off),        // Read 8-bit unsigned int
  readInt8:     (buf, off) => buf.readInt8(off),         // Read 8-bit signed int
  readUInt16LE: (buf, off) => buf.readUInt16LE(off),     // Read 16-bit unsigned int
  readUInt32LE: (buf, off) => buf.readUInt32LE(off),     // Read 32-bit unsigned int
};

// WebSocket Server Setup
// Create WebSocket server to broadcast telemetry data to clients
const wss = new WebSocket.Server({ port: WS_PORT }, () =>
  console.log(`WS on ws://localhost:${WS_PORT}`));

/**
 * Broadcasts a message to all connected WebSocket clients
 * @param {string} msg - The message to broadcast
 */
function broadcast(msg) {
  wss.clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  });
}

// UDP Server Setup
// Create UDP server to receive telemetry data from Forza Horizon 5
const udp = dgram.createSocket('udp4');

// Process incoming UDP packets
udp.on('message', data => {
  // Parse the binary data into a structured packet object
  const packet = {}
  for (let f of fields) {
    const fn = readers[f.type]
    packet[f.name] = fn
      ? fn(data, f.offset) : null;
  }
  // Broadcast the parsed data to all connected clients
  broadcast(JSON.stringify(packet));
});

/**
 * Gets the local IP address to display in console
 * @returns {string} The local IP address or 'localhost' if none found
 */
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const interfaceInfo = interfaces[interfaceName];
    for (const info of interfaceInfo) {
      // Skip internal and non-IPv4 addresses
      if (!info.internal && info.family === 'IPv4') {
        return info.address;
      }
    }
  }
  return 'localhost'; // Fallback to localhost if no external IP is found
}

// Get the local IP address for display in console
const localIp = getLocalIpAddress();

// Start the UDP server and listen for incoming packets
udp.bind(UDP_PORT, () => {
  console.log(`UDP on port ${UDP_PORT}`);
  console.log(`Send telemetry data to: ${localIp}:${UDP_PORT}`);
});

// HTTP Server Setup
// MIME types for serving static files
const mime = { 
  '.html': 'text/html', 
  '.js': 'application/javascript', 
  '.css': 'text/css' 
};

// Create HTTP server to serve static files from the public directory
http.createServer((req, res) => {
  // Default to index.html for root requests
  let urlPath = req.url === '/' ? '/index.html' : req.url;
  let file = path.join(publicDir, urlPath);
  let ext = path.extname(file);

  // Read and serve the requested file
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(HTTP_PORT, () =>
  console.log(`HTTP on http://localhost:${HTTP_PORT}`));
