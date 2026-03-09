

async function getCrowdScore(lat, lon) {

  const query = `
[out:json];
(
  node["amenity"="restaurant"](around:200,${lat},${lon});
  node["amenity"="cafe"](around:200,${lat},${lon});
  node["amenity"="fast_food"](around:200,${lat},${lon});
  node["shop"](around:200,${lat},${lon});
  node["amenity"="hospital"](around:200,${lat},${lon});
  node["amenity"="pharmacy"](around:200,${lat},${lon});
  node["amenity"="bus_station"](around:200,${lat},${lon});
  node["amenity"="taxi"](around:200,${lat},${lon});
);
out;
`;

  const response = await fetch(
    "https://overpass-api.de/api/interpreter",
    {
      method: "POST",
      body: query
    }
  );

   const data = await response.json();
   console.log(data);

  let score = 0;
  let total=0;

  data.elements.forEach(place => {
    total++;
    const amenity = place.tags.amenity;
    const shop = place.tags.shop;

    if (amenity === "restaurant") score += 3;
    else if (amenity === "cafe") score += 2;
    else if (amenity === "fast_food") score += 2;
    else if (amenity === "hospital") score += 3;
    else if (amenity === "pharmacy") score += 2;
    else if (amenity === "bus_station") score += 3;
    else if (amenity === "taxi") score += 2;
    else if (shop) score += 2;});

  return score/total;
}

async function getLightingScore(lat, lon) {

  const query = `
  [out:json];
  (
    way(around:200,${lat},${lon})["highway"];
    node(around:200,${lat},${lon})["highway"="street_lamp"];
  );
  out tags;
  `;

  const response = await fetch(
    "https://overpass-api.de/api/interpreter",
    {
      method: "POST",
      body: query
    }
  );

  const data = await response.text()

  let score = 0;
  let total = 0;
  try {
  data = JSON.parse(text);
} catch (err) {
  console.log("Overpass returned non-JSON response");
  return 0;
}

  data.elements.forEach(el => {

    if (!el.tags) return;

    total++;

    if (el.tags.lit === "yes") score += 5;
    else if (el.tags.lit === "automatic") score += 4;
    else if (el.tags.highway === "street_lamp") score += 3;
    else score += 1;

  });

  if (total === 0) return 0;

  return score / total;
}

module.exports = { getCrowdScore,getLightingScore };