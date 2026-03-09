const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 });

const OSRM_URL = "http://router.project-osrm.org/route/v1/walking";

/**
 * Get multiple route alternatives from OSRM
 * @param {number} startLat - Start latitude
 * @param {number} startLon - Start longitude
 * @param {number} endLat - End latitude
 * @param {number} endLon - End longitude
 * @returns {Array} Array of route objects with geometry
 */
async function getRoutes(startLat, startLon, endLat, endLon) {
  const cacheKey = `routes_${startLat}_${startLon}_${endLat}_${endLon}`;
  
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    // Validate coordinates
    if (!isValidCoordinate(startLat, startLon) || !isValidCoordinate(endLat, endLon)) {
      throw new Error('Invalid coordinates provided');
    }

    const url = `${OSRM_URL}/${startLon},${startLat};${endLon},${endLat}?alternatives=3&overview=full&geometries=geojson&steps=false`;

    const response = await fetch(url, {
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes) {
      throw new Error(`No routes found: ${data.message}`);
    }

    // Add metadata to each route
    const routesWithMetadata = data.routes.map((route, index) => ({
      ...route,
      routeIndex: index,
      distance: route.distance,
      duration: route.duration
    }));

    cache.set(cacheKey, routesWithMetadata);
    return routesWithMetadata;
  } catch (error) {
    console.error("Error fetching routes:", error);
    throw new Error(`Failed to fetch routes: ${error.message}`);
  }
}

/**
 * Validate latitude and longitude
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} True if valid
 */
function isValidCoordinate(lat, lon) {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Clear cache (for testing)
 */
function clearCache() {
  cache.flushAll();
}

module.exports = {
  getRoutes,
  isValidCoordinate,
  clearCache
};