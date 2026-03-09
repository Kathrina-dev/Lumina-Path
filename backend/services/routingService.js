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

  // normal route
  const r1 = await fetchRoute(startLat, startLon, endLat, endLon);
  routes.push(...r1);

  // shift north
  const r2 = await fetchRoute(
    startLat + 0.003,
    startLon,
    endLat,
    endLon
  );
  routes.push(...r2);

  // shift east
  const r3 = await fetchRoute(
    startLat,
    startLon + 0.003,
    endLat,
    endLon
  );
  routes.push(...r3);

  // shift destination south
  const r4 = await fetchRoute(
    startLat,
    startLon,
    endLat - 0.003,
    endLon
  );
  routes.push(...r4);

  return routes.slice(0, 3);
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