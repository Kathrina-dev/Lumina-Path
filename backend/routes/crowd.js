const express = require("express");
const router = express.Router();


const {getCrowdScore} =require("../services/osmService")

router.get("/", async (req, res) => {

  const { lat, lon } = req.query;

  const score = await getCrowdScore(lat, lon);

  let level = "Low";

  if (score > 20) level = "High";
  else if (score > 10) level = "Medium";

  res.json({
    crowdScore: score,
    crowdLevel: level
  });

});

module.exports = router;