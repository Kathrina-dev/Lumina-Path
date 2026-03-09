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

  const routes = [];

  // ORIGINAL ROUTE
  const main = await fetchRoute(startLat, startLon, endLat, endLon);
  routes.push(...main);

  // If OSRM gives less than 3 routes, create extra candidates
  if (routes.length < 3) {

    const shiftedStart = await fetchRoute(
      startLat + 0.002,
      startLon,
      endLat,
      endLon
    );

    routes.push(...shiftedStart);
  }

  if (routes.length < 3) {

    const shiftedEnd = await fetchRoute(
      startLat,
      startLon,
      endLat + 0.002,
      endLon
    );

    routes.push(...shiftedEnd);
  }

  // Remove duplicates
  const uniqueRoutes = routes.slice(0, 3);

  return uniqueRoutes;
}

async function fetchRoute(startLat, startLon, endLat, endLon) {

  const url =
    `${OSRM_URL}/${startLon},${startLat};${endLon},${endLat}` +
    `?alternatives=3&overview=full&geometries=geojson&steps=false`;

  const response = await fetch(url);

  const data = await response.json();

  if (!data.routes) return [];

  return data.routes.map((route, index) => ({
    ...route,
    routeIndex: index,
    distance: route.distance,
    duration: route.duration
  }));
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