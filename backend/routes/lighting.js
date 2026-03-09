const express = require("express");
const router = express.Router();

const { getLightingScore } = require("../services/osmService");

/**
 * GET /api/lighting
 * Get street lighting score at a specific location
 * 
 * Query parameters:
 * - lat: number (latitude)
 * - lon: number (longitude)
 * 
 * Response: { lightingScore, lightingLevel, timestamp }
 * 
 * Score scale:
 * - 4-5: Well Lit ✓
 * - 2-4: Moderate 
 * - 0-2: Dark ✗
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

    const score = await getLightingScore(parseFloat(lat), parseFloat(lon));

    res.json({
      success: true,
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      lightingScore: score,
      lightingLevel: getLightingLevel(score),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in lighting endpoint:", error);
    res.status(500).json({
      error: error.message || 'Failed to get lighting data'
    });
  }
});

/**
 * Get human-readable lighting level
 * @param {number} score - Lighting score (0-5)
 * @returns {string} Lighting level with emoji
 */
function getLightingLevel(score) {
  if (score >= 4) return '🌕 Well Lit';
  if (score >= 2) return '🌘 Moderate';
  return '🌑 Dark';
}

module.exports = router;