const { 
  getCrowdScore, 
  getLightingScore, 
  getHistoricalSafetyScore,
  getCCTVScore 
} = require("./osmService");

function getOptimalSampleCount(distance) {
  if (distance < 2000) return 4;
  if (distance < 5000) return 5;
  if (distance < 10000) return 6;
  return 5;
}
// Simple in-memory cache to avoid duplicate API calls
const locationCache = new Map();

/**
 * Haversine distance between two coordinates (meters)
 */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters

  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;

  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Sample points along route based on DISTANCE
 * Ensures consistent spacing regardless of coordinate density
 * 
 * @param {object} route - Route with geometry and distance
 * @param {number} targetSamples - Number of samples desired (default 12)
 * @returns {Array} Array of sampled coordinate objects {lat, lon}
 */
function sampleRoutePoints(route, targetSamples = 12) {
  const coords = route.geometry.coordinates;

  if (coords.length < 2) {
    throw new Error("Route must have at least 2 coordinates");
  }

  const totalDistance = route.distance; // OSRM provides distance in meters

  // Calculate step size: divide total distance by number of samples
  let step = totalDistance / targetSamples;

  // Ensure we never sample closer than 200 meters (minimum resolution)
  step = Math.max(step, 200);

  const samples = [];

  let lastLat = coords[0][1];
  let lastLon = coords[0][0];

  // Always include start point
  samples.push({ lat: lastLat, lon: lastLon });

  let accumulated = 0;

  // Traverse coordinates, accumulating distance
  for (let i = 1; i < coords.length; i++) {
    const lat = coords[i][1];
    const lon = coords[i][0];

    // Calculate distance from last sampled point
    const d = getDistance(lastLat, lastLon, lat, lon);
    accumulated += d;

    // If accumulated distance >= step, add sample
    if (accumulated >= step) {
      samples.push({ lat, lon });
      accumulated = 0;
      lastLat = lat;
      lastLon = lon;
    }
  }

  // Always include end point (destination is critical)
  const last = coords[coords.length - 1];
  const lastSample = samples[samples.length - 1];
  
  // Only add if not already included
  if (lastSample.lat !== last[1] || lastSample.lon !== last[0]) {
    samples.push({ lat: last[1], lon: last[0] });
  }

  return samples;
}

/**
 * Calculate safety score for a complete route
 * Uses weighted multi-factor analysis with distance-based sampling
 * 
 * Weighting:
 * - Lighting: 35% (most important)
 * - Foot Traffic: 25%
 * - Open Stores/Safe Places: 20%
 * - CCTV Coverage: 10%
 * - Historical Safety/Crime: 10%
 * 
 * @param {object} route - Route object from OSRM with geometry
 * @returns {object} Detailed safety analysis
 */
async function calculateRouteSafety(route) {
  try {
    if (!route || !route.geometry || !route.geometry.coordinates) {
      throw new Error('Invalid route object');
    }

    if (!route.distance || route.distance <= 0) {
      throw new Error('Route must have valid distance');
    }
    const optimalCount = getOptimalSampleCount(route.distance);
    // Sample points at consistent distance intervals
    const samples = sampleRoutePoints(route, optimalCount);
   

    console.log(`📍 Analyzing route: ${route.distance}m distance, ${samples.length} samples`);

    // Fetch safety data for each sample point in parallel
    const scorePromises = samples.map(async (point) => {
      console.log(point)
      // Create cache key from coordinates (rounded to 3 decimals = ~100m precision)
      const cacheKey = `${point.lat.toFixed(3)},${point.lon.toFixed(3)}`;

      // Check cache first
      if (locationCache.has(cacheKey)) {
        return locationCache.get(cacheKey);
      }

      // Fetch safety data in parallel (4 concurrent API calls per point)
      const [lighting, crowd, cctv, historical] = await Promise.all([
        getLightingScore(point.lat, point.lon),
        getCrowdScore(point.lat, point.lon),
        getCCTVScore(point.lat, point.lon),
        getHistoricalSafetyScore(point.lat, point.lon)
      ]);

      // Crowdsourced reports/foot traffic indicates likely open stores
      const openStores = Math.min(5, crowd * 1.2);

      // Calculate weighted safety score for this point
      const weightedScore = 
        (lighting * 0.35) +      // Lighting: 35% - most important
        (crowd * 0.25) +         // Foot traffic: 25%
        (openStores * 0.20) +    // Open stores/amenities: 20%
        (cctv * 0.10) +          // CCTV: 10%
        (historical * 0.10);     // Crime/historical data: 10%

      const result = {
        coordinates: [point.lon, point.lat],
        lighting,
        crowd,
        cctv,
        openStores,
        historical,
        score: weightedScore
      };

      // Cache for future use
      locationCache.set(cacheKey, result);

      return result;
    });

    // Wait for all analysis points to complete
    const scores = await Promise.all(scorePromises);

    // Calculate aggregate statistics
    const overallScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    const minScore = Math.min(...scores.map(s => s.score));
    const maxScore = Math.max(...scores.map(s => s.score));

    // Identify risk zones (areas below 2.0 safety score)
    const riskZones = scores.filter(s => s.score < 2);

    return {
      overallScore: Number(overallScore.toFixed(2)),
      minScore: Number(minScore.toFixed(2)),
      maxScore: Number(maxScore.toFixed(2)),
      sampleCount: scores.length,
      averageSampling: Number((route.distance / scores.length).toFixed(0)), // meters between samples
      detailedScores: scores,
      safetyLevel: getSafetyLevel(overallScore),
      riskZones: riskZones,
      riskZoneCount: riskZones.length
    };
  } catch (error) {
    console.error("Error calculating route safety:", error);
    throw new Error(`Failed to calculate route safety: ${error.message}`);
  }
}

/**
 * Get human-readable safety level based on score
 * @param {number} score - Safety score (0-5)
 * @returns {string} Safety level
 */
function getSafetyLevel(score) {
  if (score >= 4.5) return 'Very Safe ✓✓';
  if (score >= 4.0) return 'Very Safe ✓';
  if (score >= 3.5) return 'Safe ✓';
  if (score >= 3.0) return 'Safe';
  if (score >= 2.0) return 'Moderate ⚠️';
  if (score >= 1.0) return 'Unsafe ✗';
  return 'Very Unsafe ✗✗';
}

/**
 * Rank multiple routes by safety (highest score first)
 * Analyzes each route and returns sorted by safety
 * 
 * @param {Array} routes - Array of route objects from OSRM
 * @returns {Array} Routes sorted by safety score (descending)
 */
async function rankRoutesBySafety(routes) {
  try {
    if (!Array.isArray(routes) || routes.length === 0) {
      throw new Error('Must provide at least one route');
    }

    console.log(`🔍 Analyzing ${routes.length} alternative routes for safety`);

    // Calculate safety for all routes in parallel
    const routesWithSafety = await Promise.all(
      routes.map(async (route, index) => {
        try {
          const safety = await calculateRouteSafety(route);
          return {
            routeIndex: index,
            ...route,
            safety
          };
        } catch (error) {
          console.error(`Error analyzing route ${index}:`, error);
          throw error;
        }
      })
    );

    // Sort by overall safety score (highest first)
    const sorted = routesWithSafety.sort((a, b) => 
      b.safety.overallScore - a.safety.overallScore
    );

    console.log(`✅ Analysis complete. Safest route: ${sorted[0].safety.safetyLevel}`);

    return sorted;
  } catch (error) {
    console.error("Error ranking routes:", error);
    throw new Error(`Failed to rank routes: ${error.message}`);
  }
}

/**
 * Clear the location cache (useful for testing)
 */
function clearCache() {
  const size = locationCache.size;
  locationCache.clear();
  console.log(`🧹 Cache cleared (${size} entries removed)`);
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  return {
    size: locationCache.size,
    entries: Array.from(locationCache.keys()).slice(0, 10) // First 10 entries
  };
}

module.exports = {
  calculateRouteSafety,
  rankRoutesBySafety,
  getSafetyLevel,
  clearCache,
  getCacheStats,
  getDistance,
  sampleRoutePoints // Export for testing
};