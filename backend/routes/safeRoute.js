const express = require("express");
const router = express.Router();

const { getRoutes } = require("../services/routingService");
const { rankRoutesBySafety, calculateRouteSafety } = require("../services/safetyService");

/**
 * POST /api/safe-route
 * Calculate safest route between two points
 * 
 * Request body:
 * {
 *   "start": { "lat": number, "lon": number },
 *   "end": { "lat": number, "lon": number }
 * }
 * 
 * Response:
 * {
 *   "safestRoute": {...},
 *   "allRoutes": [...]
 * }
 */
router.post("/", async (req, res) => {
  try {
    const { start, end } = req.body;

    // Validation
    if (!start || !end || typeof start.lat !== 'number' || typeof start.lon !== 'number') {
      return res.status(400).json({
        error: 'Invalid request. Please provide start and end coordinates.',
        example: {
          start: { lat: 40.7128, lon: -74.0060 },
          end: { lat: 40.7589, lon: -73.9851 }
        }
      });
    }

    // Get all route alternatives
    const routes = await getRoutes(
      start.lat,
      start.lon,
      end.lat,
      end.lon
    );

    if (routes.length === 0) {
      return res.status(404).json({ error: 'No routes found between the given coordinates' });
    }

    // Rank routes by safety
    const rankedRoutes = await rankRoutesBySafety(routes);

    // Return safest route and alternatives
    res.json({
      success: true,
      safestRoute: {
        route: rankedRoutes[0],
        safety: rankedRoutes[0].safety
      },
      alternativeRoutes: rankedRoutes.slice(1).map(route => ({
        route,
        safety: route.safety
      })),
      totalRoutesAnalyzed: rankedRoutes.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in safe-route endpoint:", error);
    res.status(500).json({
      error: error.message || 'Failed to calculate safe route'
    });
  }
});

/**
 * POST /api/safe-route/compare
 * Compare safety of specific routes
 * 
 * Request body:
 * {
 *   "routes": [array of route geometry objects]
 * }
 */
router.post("/compare", async (req, res) => {
  try {
    const { routes } = req.body;

    if (!Array.isArray(routes) || routes.length === 0) {
      return res.status(400).json({
        error: 'Please provide an array of routes to compare'
      });
    }

    const safetyScores = await Promise.all(
      routes.map(route => calculateRouteSafety(route))
    );

    res.json({
      success: true,
      routeComparison: routes.map((route, index) => ({
        routeIndex: index,
        safety: safetyScores[index]
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in compare endpoint:", error);
    res.status(500).json({
      error: error.message || 'Failed to compare routes'
    });
  }
});

/**
 * GET /api/safe-route/health
 * Check if routing service is operational
 */
router.get("/health", (req, res) => {
  res.json({
    status: 'operational',
    service: 'safe-route',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;