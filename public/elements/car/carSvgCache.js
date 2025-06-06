/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        carSvgCache.js: 
          Preloads and caches car SVG files to prevent flashing during
          rendering and improve performance
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

// Cache object to store loaded SVG data
const svgCache = {
    side: null,
    front: null,
    top: null
};

// Promise to track loading status
let loadingPromise = null;

/**
 * Preloads all car SVG files and stores them in the cache
 * @returns {Promise} A promise that resolves when all SVGs are loaded
 */
export function preloadCarSvgs() {
    // Only load once
    if (loadingPromise) {
        return loadingPromise;
    }

    // Create a promise that resolves when all SVGs are loaded
    loadingPromise = Promise.all([
        d3.xml("/elements/car/carSide.svg").then(data => {
            svgCache.side = data;
        }),
        d3.xml("/elements/car/carFront.svg").then(data => {
            svgCache.front = data;
        }),
        d3.xml("/elements/car/carTop.svg").then(data => {
            svgCache.top = data;
        })
    ]).catch(error => {
        console.error("Error preloading car SVGs:", error);
    });

    return loadingPromise;
}

/**
 * Retrieves a cached SVG by type
 * @param {string} type - The type of SVG to retrieve ('side', 'front', or 'top')
 * @returns {Document|null} The cached SVG document or null if not loaded
 */
export function getCachedSvg(type) {
    if (!svgCache[type]) {
        console.warn(`SVG cache for ${type} not loaded yet`);
    }
    return svgCache[type];
}
