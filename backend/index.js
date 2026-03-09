const express = require('express');
const app = express();
require('dotenv').config();
app.use(express.json());

const {getLightingScore} = require("./services/osmService")
const crowdRoutes=require("./routes/crowd")
const safeRoute = require("./routes/safeRoute");



const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, Lumina Path!');
});

app.use("/safe-route", safeRoute);
app.use("/crowd", crowdRoutes);



app.get("/lighting", async (req, res) => {

  const { lat, lon } = req.query;

  const lightingScore = await getLightingScore(lat, lon);

  res.json({
    lightingScore
  });
//   score > 4 → Well Lit
// score 2–4 → Moderate
// score < 2 → Dark

});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});