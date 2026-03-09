const { getCrowdScore, getLightingScore } = require("./osmService");

async function calculateRouteSafety(route) {

  const coordinates = route.geometry.coordinates;

  let totalScore = 0;
  let samples = 0;

  for (let i = 0; i < coordinates.length; i += 20) {

    const [lon, lat] = coordinates[i];

    const crowd = await getCrowdScore(lat, lon);
    const lighting = await getLightingScore(lat, lon);

    const score =
      0.6 * crowd +
      0.4 * lighting;

    totalScore += score;
    samples++;

  }

  return totalScore / samples;
}

module.exports = { calculateRouteSafety };