const express = require("express");
const router = express.Router();
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 });

const OSM_OVERPASS_URL = "https://overpass-api.de/api/interpreter";

/**
 * GET /api/safe-places
 * Find safe places (hospitals, police, 24/7 stores) in an area
 * 
 * Query parameters:
 * - lat: number (center latitude)
 * - lon: number (center longitude)
 * - radius: number (in meters, default 1000)
 * - type: string (hospital|pharmacy|police|store, optional)
 */
router.get("/", async (req, res) => {
  try {
    const { lat, lon, radius = 1000, type } = req.query;

    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        error: 'Missing or invalid coordinates',
        example: '?lat=40.7128&lon=-74.0060&radius=1000'
      });
    }

    const places = await findSafePlaces(
      parseFloat(lat),
      parseFloat(lon),
      parseFloat(radius),
      type
    );

    res.json({
      success: true,
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      radius: parseFloat(radius),
      placeCount: places.length,
      places,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching safe places:", error);
    res.status(500).json({
      error: error.message || 'Failed to fetch safe places'
    });
  }
});

/**
 * Find safe places in area using OSM
 * @param {number} lat - Center latitude
 * @param {number} lon - Center longitude
 * @param {number} radius - Search radius in meters
 * @param {string} type - Filter by type (optional)
 * @returns {Array} Array of safe places
 */
async function findSafePlaces(lat, lon, radius, type = null) {
  const cacheKey = `safeplaces_${lat}_${lon}_${radius}_${type}`;
  
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    let query = `
[out:json];
(
`;

    // Default: search all types
    if (!type || type === 'hospital') {
      query += `  node["amenity"="hospital"](around:${radius},${lat},${lon});
  way["amenity"="hospital"](around:${radius},${lat},${lon});
`;
    }
    
    if (!type || type === 'pharmacy') {
      query += `  node["amenity"="pharmacy"](around:${radius},${lat},${lon});
  way["amenity"="pharmacy"](around:${radius},${lat},${lon});
`;
    }
    
    if (!type || type === 'police') {
      query += `  node["amenity"="police"](around:${radius},${lat},${lon});
  way["amenity"="police"](around:${radius},${lat},${lon});
`;
    }
    
    if (!type || type === 'store') {
      query += `  node["shop"="supermarket"]["opening_hours"~"24/7"](around:${radius},${lat},${lon});
  node["amenity"="convenience"]["opening_hours"~"24/7"](around:${radius},${lat},${lon});
`;
    }

    query += `
);
out center;
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

    if (!data.elements) {
      cache.set(cacheKey, []);
      return [];
    }

    // Format places
    const places = data.elements.map(el => {
      const coords = el.center || { lat: el.lat, lon: el.lon };
      
      return {
        id: el.id,
        name: el.tags?.name || 'Unknown',
        type: getPlaceType(el.tags),
        lat: coords.lat,
        lon: coords.lon,
        address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || 'Address not available',
        phone: el.tags?.phone || null,
        website: el.tags?.website || null,
        openingHours: el.tags?.opening_hours || null,
        wheelchair: el.tags?.wheelchair || null,
        distance: calculateDistance(lat, lon, coords.lat, coords.lon)
      };
    });

    // Sort by distance
    places.sort((a, b) => a.distance - b.distance);

    cache.set(cacheKey, places);
    return places;

  } catch (error) {
    console.error("Error fetching safe places:", error);
    return [];
  }
}

/**
 * Determine place type from OSM tags
 * @param {object} tags - OSM tags
 * @returns {string} Place type
 */
function getPlaceType(tags) {
  if (tags?.amenity === 'hospital') return 'hospital';
  if (tags?.amenity === 'pharmacy') return 'pharmacy';
  if (tags?.amenity === 'police') return 'police';
  if (tags?.shop === 'supermarket') return 'supermarket';
  if (tags?.amenity === 'convenience') return 'convenience_store';
  return 'other';
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

module.exports = router;