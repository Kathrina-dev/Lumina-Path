const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 });

const OSM_OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// ==================== RETRY & TIMEOUT CONFIGURATION ====================

const FETCH_CONFIG = {
  timeout: 30000,        // 30 seconds
  maxRetries: 3,         // Retry up to 3 times
  retryDelay: 2000,      // Wait 2 seconds between retries
};

// ==================== HELPER: Fetch with Timeout ====================

async function fetchWithTimeout(url, options = {}, timeout = FETCH_CONFIG.timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ==================== HELPER: Retry Logic ====================

async function fetchWithRetry(url, options = {}, retries = FETCH_CONFIG.maxRetries) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📡 Overpass API attempt ${attempt}/${retries}`);
      
      const response = await fetchWithTimeout(url, options, FETCH_CONFIG.timeout);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API call successful on attempt ${attempt}`);
      return data;

    } catch (error) {
      lastError = error;
      
      const isNetworkError = 
        error.name === 'AbortError' || 
        error.message.includes('timeout') ||
        error.message.includes('Connect Timeout') ||
        error.code === 'UND_ERR_CONNECT_TIMEOUT' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ENOTFOUND' ||
        error.message.includes('ECONNRESET') ||
        error.message.includes('fetch failed');

      if (!isNetworkError || attempt === retries) {
        console.error(`❌ API call failed: ${error.message}`);
        break;
      }

      const delay = FETCH_CONFIG.retryDelay * attempt;
      console.warn(`⏳ Retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// ==================== THE OPTIMIZED UNIFIED FUNCTION ====================

/**
 * ⭐ GET ALL LOCATION DATA IN ONE API CALL
 * 
 * INSTEAD OF 4 separate API calls (lighting, crowd, cctv, historical),
 * make 1 query that gets ALL data at once!
 * 
 * KEY INSIGHT:
 *   All these things are in the SAME location (same 200m radius)
 *   One Overpass query can fetch all tag types:
 *   - Lighting tags (lit=yes, street_lamp)
 *   - Amenity tags (restaurant, cafe, hospital, etc)
 *   - Surveillance tags (man_made=surveillance)
 *   - All in ONE response!
 * 
 * Result: 66% reduction in API calls!
 * Before: 12 points × 4 calls = 48 API calls per route
 * After:  12 points × 1 call = 12 API calls per route ✅
 */
async function getCompleteLocationData(lat, lon) {
  const cacheKey = `location_${lat.toFixed(3)}_${lon.toFixed(3)}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`📦 Cache hit: ${lat.toFixed(4)},${lon.toFixed(4)}`);
    return cached;
  }
  console.log("Cache miss")
  try {
    // ✅ SINGLE QUERY that gets ALL safety data at once
    const query = `
[out:json];
(
  // Lighting data
  way(around:200,${lat},${lon})["highway"]["lit"];
  node(around:200,${lat},${lon})["highway"="street_lamp"];
  way(around:200,${lat},${lon})["highway"="residential"]["lit"="yes"];
  way(around:200,${lat},${lon})["highway"="tertiary"]["lit"="yes"];
  
  // Crowd/Amenity data
  node["amenity"="restaurant"](around:200,${lat},${lon});
  node["amenity"="cafe"](around:200,${lat},${lon});
  node["amenity"="fast_food"](around:200,${lat},${lon});
  node["shop"](around:200,${lat},${lon});
  node["amenity"="hospital"](around:200,${lat},${lon});
  node["amenity"="pharmacy"](around:200,${lat},${lon});
  node["amenity"="bus_station"](around:200,${lat},${lon});
  node["amenity"="taxi"](around:200,${lat},${lon});
  node["amenity"="school"](around:200,${lat},${lon});
  
  // CCTV/Surveillance data
  node(around:200,${lat},${lon})["man_made"="surveillance"];
  way(around:200,${lat},${lon})["man_made"="surveillance"];
);
out tags;
`;

    console.log(`📡 Fetching ALL data (lighting, crowd, CCTV) for ${lat.toFixed(4)},${lon.toFixed(4)}`);
    
    // ✅ ONE API CALL gets everything
    const data = await fetchWithRetry(
      OSM_OVERPASS_URL,
      { method: "POST", body: query }
    );

    // ✅ Process ALL data from single response
    const result = processAllLocationData(data);

    cache.set(cacheKey, result);
    return result;

  } catch (error) {
    console.error(`⚠️  Error fetching location data: ${error.message}`);
    // Fallback values
    return {
      lighting: 2,
      crowd: 3,
      cctv: 2,
      historical: 3,
      source: 'fallback'
    };
  }
}

// ==================== PROCESS UNIFIED RESPONSE ====================

/**
 * Process the combined API response to extract all scores
 * from a SINGLE API call
 */
function processAllLocationData(data) {
  if (!data.elements || data.elements.length === 0) {
    return {
      lighting: 2,
      crowd: 2,
      cctv: 2,
      historical: 3,
      source: 'api_empty'
    };
  }

  let lightingScore = 0;
  let lightingCount = 0;
  
  let crowdScore = 0;
  let crowdCount = 0;
  
  let cctvScore = 0;
  let cctvCount = 0;

  // ✅ Process each element from the SINGLE API response
  data.elements.forEach(element => {
    if (!element.tags) return;

    // ===== LIGHTING ===== 
    if (element.tags.lit === "yes") {
      lightingScore += 5;
      lightingCount++;
    } else if (element.tags.lit === "automatic") {
      lightingScore += 4;
      lightingCount++;
    } else if (element.tags.highway === "street_lamp") {
      lightingScore += 5;
      lightingCount++;
    }

    // ===== CROWD/AMENITIES =====
    const amenity = element.tags.amenity;
    const shop = element.tags.shop;
    
    const amenityWeights = {
      restaurant: 3,
      cafe: 2,
      fast_food: 2,
      hospital: 4,
      pharmacy: 2,
      bus_station: 3,
      taxi: 2,
      school: 2
    };

    if (amenity && amenityWeights[amenity]) {
      crowdScore += amenityWeights[amenity];
      crowdCount++;
    } else if (shop) {
      crowdScore += 1.5;
      crowdCount++;
    }

    // ===== CCTV/SURVEILLANCE =====
    if (element.tags["man_made"] === "surveillance") {
      cctvScore += 3;
      cctvCount++;
    }
  });

  // ✅ Normalize scores to 0-5 scale
  const lighting = lightingCount > 0 ? Math.min(5, lightingScore / lightingCount) : 2;
  const crowd = crowdCount > 0 ? Math.min(5, (crowdScore / crowdCount) * 2) : 2;
  const cctv = cctvCount > 0 ? Math.min(5, cctvScore * 0.5) : 2;
  const historical = 3; // Placeholder for now

  return {
    lighting: Number(lighting.toFixed(2)),
    crowd: Number(crowd.toFixed(2)),
    cctv: Number(cctv.toFixed(2)),
    historical: Number(historical.toFixed(2)),
    source: 'api'
  };
}

// ==================== SCORE FUNCTIONS (Now All Use Unified Function) ====================

/**
 * Get lighting score
 * NOW: Uses single unified function that gets all data at once
 */
async function getLightingScore(lat, lon) {
  const data = await getCompleteLocationData(lat, lon);
  return data.lighting;
}

/**
 * Get crowd score
 * NOW: Uses single unified function that gets all data at once
 */
async function getCrowdScore(lat, lon) {
  const data = await getCompleteLocationData(lat, lon);
  return data.crowd;
}

/**
 * Get CCTV score
 * NOW: Uses single unified function that gets all data at once
 */
async function getCCTVScore(lat, lon) {
  const data = await getCompleteLocationData(lat, lon);
  return data.cctv;
}

/**
 * Get historical safety score
 * NOW: Uses single unified function (no API call needed)
 */
async function getHistoricalSafetyScore(lat, lon) {
  const data = await getCompleteLocationData(lat, lon);
  return data.historical;
}

/**
 * Clear cache (for testing)
 */

// Every minut
function clearCache() {
  cache.flushAll();
  console.log("🧹 Cache cleared");
}

module.exports = {
  getCrowdScore,
  getLightingScore,
  getCCTVScore,
  getHistoricalSafetyScore,
  clearCache,
  fetchWithRetry,
  getCompleteLocationData
};