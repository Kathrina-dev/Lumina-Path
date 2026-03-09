const express = require("express");
const router = express.Router();

// Temporary in-memory storage (replace with database)
let reports = [];
let reportIdCounter = 1;

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
    const { lat, lon, type, description, severity = 3, userId } = req.body;

    // Validation
    if (!lat || !lon || !type || !description) {
      return res.status(400).json({
        error: 'Missing required fields: lat, lon, type, description',
        types: ['dark_street', 'harassment', 'broken_light', 'unsafe_crowd', 'other']
      });
    }

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    if (severity < 1 || severity > 5 || !Number.isInteger(severity)) {
      return res.status(400).json({ error: 'Severity must be an integer between 1-5' });
    }

    const report = {
      id: reportIdCounter++,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      type,
      description,
      severity,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString(),
      votes: 1 // Upvote count
    };

    reports.push(report);

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      report,
      timestamp: new Date().toISOString()
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
router.get("/", (req, res) => {
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
    const nearbyReports = reports.filter(report => {
      const distance = calculateDistance(centerLat, centerLon, report.lat, report.lon);
      
      let typeMatch = true;
      if (type) typeMatch = report.type === type;

      let severityMatch = report.severity >= minSev;

      return distance <= searchRadius && typeMatch && severityMatch;
    });

    // Sort by recency and votes
    nearbyReports.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      const timeDiff = timeB - timeA; // Newer first
      
      if (timeDiff !== 0) return timeDiff;
      return b.votes - a.votes; // Then by votes
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

/**
 * GET /api/reports/:id
 * Get a specific report
 */
router.get("/:id", (req, res) => {
  const report = reports.find(r => r.id === parseInt(req.params.id));

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  res.json({
    success: true,
    report,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/reports/:id/upvote
 * Upvote a report to increase visibility
 */
router.post("/:id/upvote", (req, res) => {
  const report = reports.find(r => r.id === parseInt(req.params.id));

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  report.votes++;

  res.json({
    success: true,
    message: 'Report upvoted',
    report,
    timestamp: new Date().toISOString()
  });
});

/**
 * DELETE /api/reports/:id
 * Delete a report (admin only in production)
 */
router.delete("/:id", (req, res) => {
  const index = reports.findIndex(r => r.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const deletedReport = reports.splice(index, 1);

  res.json({
    success: true,
    message: 'Report deleted',
    report: deletedReport[0],
    timestamp: new Date().toISOString()
  });
});

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