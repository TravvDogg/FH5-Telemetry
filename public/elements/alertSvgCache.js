/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        alertSvgCache.js: 
          Preloads and caches alert SVG files to prevent flashing during
          rendering and improve performance
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

// Cache object to store loaded SVG data
const svgCache = {
    none: null,
    suspension: null,
    'off-ground': null,
    slip: null,
    handbrake: null
};

// Promise to track loading status
let loadingPromise = null;

/**
 * Preloads all alert SVG files and stores them in the cache
 * @returns {Promise} A promise that resolves when all SVGs are loaded
 */
export function preloadAlertSvgs() {
    // Only load once
    if (loadingPromise) {
        return loadingPromise;
    }

    // Create a promise that resolves when all SVGs are loaded
    loadingPromise = Promise.all([
        d3.xml("/elements/alerts/none.svg").then(data => {
            svgCache.none = data;
        }),
        d3.xml("/elements/alerts/suspension.svg").then(data => {
            svgCache.suspension = data;
        }),
        d3.xml("/elements/alerts/off-ground.svg").then(data => {
            svgCache['off-ground'] = data;
        }),
        d3.xml("/elements/alerts/slip.svg").then(data => {
            svgCache.slip = data;
        }),
        d3.xml("/elements/alerts/handbrake.svg").then(data => {
            svgCache.handbrake = data;
        })
    ]).catch(error => {
        console.error("Error preloading alert SVGs:", error);
    });

    return loadingPromise;
}

/**
 * Retrieves a cached SVG by type
 * @param {string} type - The type of SVG to retrieve ('none', 'suspension', 'off-ground', 'slip', or 'handbrake')
 * @returns {Document|null} The cached SVG document or null if not loaded
 */
export function getCachedAlertSvg(type) {
    if (!svgCache[type]) {
        console.warn(`Alert SVG cache for ${type} not loaded yet`);
    }
    return svgCache[type];
}