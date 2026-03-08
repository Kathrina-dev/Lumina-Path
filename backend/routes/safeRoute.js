const express = require("express");
const router = express.Router();

const { getRoutes } = require("../services/routingService");
const { calculateRouteSafety } = require("../services/safetyService");

router.post("/", async (req, res) => {

  const { start, end } = req.body;

  const routes = await getRoutes(
    start.lat,
    start.lon,
    end.lat,
    end.lon
  );

  let safestRoute = null;
  let bestScore = -Infinity;

  for (const route of routes) {

    const score = await calculateRouteSafety(route);

    if (score > bestScore) {
      bestScore = score;
      safestRoute = route;
    }

  }

  res.json({
    safetyScore: bestScore,
    safestRoute
  });

});

module.exports = router;