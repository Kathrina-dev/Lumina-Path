const express = require("express");
const router = express.Router();

const { getCrowdScore } = require("../services/osmService");

/**
 * GET /api/crowd
 * Get crowd/pedestrian density at a specific location
 * 
 * Query parameters:
 * - lat: number (latitude)
 * - lon: number (longitude)
 * 
 * Response: { crowdScore, crowdLevel, timestamp }
 */
router.get("/", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        error: 'Missing or invalid coordinates',
        example: '?lat=40.7128&lon=-74.0060'
      });
    }

    const score = await getCrowdScore(parseFloat(lat), parseFloat(lon));

    res.json({
      success: true,
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      crowdScore: score,
      crowdLevel: getCrowdLevel(score),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in crowd endpoint:", error);
    res.status(500).json({
      error: error.message || 'Failed to get crowd data'
    });
  }
});

/**
 * Get human-readable crowd level
 * @param {number} score - Crowd score (0-5)
 * @returns {string} Crowd level description
 */
function getCrowdLevel(score) {
  if (score >= 4) return 'Very High';
  if (score >= 3) return 'High';
  if (score >= 2) return 'Moderate';
  if (score >= 1) return 'Low';
  return 'Very Low';
}

module.exports = router;