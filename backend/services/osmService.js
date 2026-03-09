const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 }); // 10 minute cache

const OSM_OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const CACHE_TTL = 600; // seconds

/**
 * Get crowd/pedestrian density score based on nearby amenities
 * Score based on restaurants, shops, hospitals, transit stations
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {number} Crowd score (0-5)
 */
async function getCrowdScore(lat, lon) {
  const cacheKey = `crowd_${Math.round(lat * 100)}_${Math.round(lon * 100)}`;
  
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const query = `
[out:json];
(
  node["amenity"="restaurant"](around:200,${lat},${lon});
  node["amenity"="cafe"](around:200,${lat},${lon});
  node["amenity"="fast_food"](around:200,${lat},${lon});
  node["shop"](around:200,${lat},${lon});
  node["amenity"="hospital"](around:200,${lat},${lon});
  node["amenity"="pharmacy"](around:200,${lat},${lon});
  node["amenity"="bus_station"](around:200,${lat},${lon});
  node["amenity"="taxi"](around:200,${lat},${lon});
  node["amenity"="school"](around:200,${lat},${lon});
);
out tags;
`;

    const response = await fetch(OSM_OVERPASS_URL, {
      method: "POST",
      body: query,
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.elements || data.elements.length === 0) {
      cache.set(cacheKey, 0);
      return 0;
    }

    let score = 0;
    const weights = {
      restaurant: 3,
      cafe: 2,
      fast_food: 2,
      hospital: 4,
      pharmacy: 2,
      bus_station: 3,
      taxi: 2,
      school: 2,
      shop: 1.5
    };

    data.elements.forEach(place => {
      const amenity = place.tags?.amenity;
      const shop = place.tags?.shop;

      if (amenity && weights[amenity]) {
        score += weights[amenity];
      } else if (shop) {
        score += weights.shop;
      }
    });

    // Normalize to 0-5 scale
    const normalizedScore = Math.min(5, (score / data.elements.length) * 2);
    
    cache.set(cacheKey, normalizedScore);
    return normalizedScore;
  } catch (error) {
    console.error("Error getting crowd score:", error);
    return 2; // Return moderate score on error
  }
}

/**
 * Get lighting score based on street lights and lit highways
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {number} Lighting score (0-5)
 */
async function getLightingScore(lat, lon) {
  const cacheKey = `lighting_${Math.round(lat * 100)}_${Math.round(lon * 100)}`;
  
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const query = `
[out:json];
(
  way(around:200,${lat},${lon})["highway"]["lit"];
  node(around:200,${lat},${lon})["highway"="street_lamp"];
  way(around:200,${lat},${lon})["highway"="residential"]["lit"="yes"];
  way(around:200,${lat},${lon})["highway"="tertiary"]["lit"="yes"];
);
out tags;
`;

    const response = await fetch(OSM_OVERPASS_URL, {
      method: "POST",
      body: query,
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.elements || data.elements.length === 0) {
      cache.set(cacheKey, 2); // Default to moderate if no data
      return 2;
    }

    let score = 0;
    let total = 0;

    data.elements.forEach(el => {
      if (!el.tags) return;

      total++;

      if (el.tags.lit === "yes") {
        score += 5;
      } else if (el.tags.lit === "automatic") {
        score += 4;
      } else if (el.tags.highway === "street_lamp") {
        score += 5;
      } else {
        score += 2;
      }
    });

    const normalizedScore = total === 0 ? 2 : Math.min(5, score / total);
    
    cache.set(cacheKey, normalizedScore);
    return normalizedScore;
  } catch (error) {
    console.error("Error getting lighting score:", error);
    return 2; // Return moderate score on error
  }
}

/**
 * Get historical safety data (crowdsourced reports in area)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {number} Safety score (0-5)
 */
async function getHistoricalSafetyScore(lat, lon) {
  // This would query your database for crowdsourced reports
  // For now, returns a default value
  // Implementation depends on database setup
  return 3; // Neutral score
}

/**
 * Get CCTV coverage score (from OSM if available)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {number} CCTV score (0-5)
 */
async function getCCTVScore(lat, lon) {
  const cacheKey = `cctv_${Math.round(lat * 100)}_${Math.round(lon * 100)}`;
  
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const query = `
[out:json];
(
  node(around:200,${lat},${lon})["man_made"="surveillance"];
  way(around:200,${lat},${lon})["man_made"="surveillance"];
);
out tags;
`;

    const response = await fetch(OSM_OVERPASS_URL, {
      method: "POST",
      body: query,
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    
    const score = Math.min(5, (data.elements?.length || 0) * 0.5);
    cache.set(cacheKey, score);
    return score;
  } catch (error) {
    console.error("Error getting CCTV score:", error);
    return 2;
  }
}

/**
 * Clear cache (for testing or maintenance)
 */
function clearCache() {
  cache.flushAll();
}

module.exports = {
  getCrowdScore,
  getLightingScore,
  getHistoricalSafetyScore,
  getCCTVScore,
  clearCache
};