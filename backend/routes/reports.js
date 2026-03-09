const express = require("express");
const router = express.Router();
const Report = require("../models/Report");

/**
 * POST /api/reports
 * Submit a safety report (dark street, harassment, etc.)
 * 
 * Request body:
 * {
 *   "lat": number,
 *   "lon": number,
 *   "type": "dark_street" | "harassment" | "broken_light" | "unsafe_crowd" | "other",
 *   "description": string,
 *   "severity": 1-5 (optional),
 *   "userId": string (optional)
 * }
 */
router.post("/", async (req, res) => {
  try {
    const { lat, lon, type, severity = 3, userId } = req.body;

    // Validation
    if (!lat || !lon || !type ) {
      return res.status(400).json({
        error: 'Missing required fields: lat, lon, type',
        types: ['dark_street', 'harassment', 'broken_light', 'unsafe_crowd', 'other']
      });
    }

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    if (severity < 1 || severity > 5 || !Number.isInteger(severity)) {
      return res.status(400).json({ error: 'Severity must be an integer between 1-5' });
    }

    const report = await Report.create({
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      type,
      severity,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      report
    });


  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({
      error: error.message || 'Failed to submit report'
    });
  }
});

/**
 * GET /api/reports
 * Get safety reports in an area
 * 
 * Query parameters:
 * - lat: number (center latitude)
 * - lon: number (center longitude)
 * - radius: number (in meters, default 500)
 * - type: string (filter by report type, optional)
 * - minSeverity: number (filter by minimum severity, default 1)
 */
router.get("/", async (req, res) => {
  try {
    const { lat, lon, radius = 500, type, minSeverity = 1 } = req.query;

    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        error: 'Missing or invalid coordinates',
        example: '?lat=40.7128&lon=-74.0060&radius=500'
      });
    }

    const centerLat = parseFloat(lat);
    const centerLon = parseFloat(lon);
    const searchRadius = parseFloat(radius);
    const minSev = parseInt(minSeverity);

    // Filter reports in the radius
    const nearbyReports = await Report.find({
      lat: { $gte: centerLat - 0.002, $lte: centerLat + 0.002 },
      lon: { $gte: centerLon - 0.002, $lte: centerLon + 0.002 },
      severity: { $gte: minSev }
    });

    // Sort by recency and votes
    nearbyReports.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    res.json({
      success: true,
      location: { lat: centerLat, lon: centerLon },
      radius: searchRadius,
      reportCount: nearbyReports.length,
      reports: nearbyReports,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      error: error.message || 'Failed to fetch reports'
    });
  }
});

// /**
//  * GET /api/reports/:id
//  * Get a specific report
//  */
// router.get("/:id", async (req, res) => {
//   const report = reports.find(r => r.id === parseInt(req.params.id));

//   if (!report) {
//     return res.status(404).json({ error: 'Report not found' });
//   }

//   res.json({
//     success: true,
//     report,
//     timestamp: new Date().toISOString()
//   });
// });

// /**
//  * POST /api/reports/:id/upvote
//  * Upvote a report to increase visibility
//  */
// router.post("/:id/upvote", (req, res) => {
//   const report = reports.find(r => r.id === parseInt(req.params.id));

//   if (!report) {
//     return res.status(404).json({ error: 'Report not found' });
//   }

//   report.votes++;

//   res.json({
//     success: true,
//     message: 'Report upvoted',
//     report,
//     timestamp: new Date().toISOString()
//   });
// });

// /**
//  * DELETE /api/reports/:id
//  * Delete a report (admin only in production)
//  */
// router.delete("/:id", (req, res) => {
//   const index = reports.findIndex(r => r.id === parseInt(req.params.id));

//   if (index === -1) {
//     return res.status(404).json({ error: 'Report not found' });
//   }

//   const deletedReport = reports.splice(index, 1);

//   res.json({
//     success: true,
//     message: 'Report deleted',
//     report: deletedReport[0],
//     timestamp: new Date().toISOString()
//   });
// });

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