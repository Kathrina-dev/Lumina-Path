async function getRoutes(startLat, startLon, endLat, endLon) {

  const url = `http://router.project-osrm.org/route/v1/walking/${startLon},${startLat};${endLon},${endLat}?alternatives=true&overview=full&geometries=geojson`;

  const response = await fetch(url);

  const data = await response.json();

  return data.routes;
}

module.exports = { getRoutes };