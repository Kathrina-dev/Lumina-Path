const express = require('express');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, Lumina Path!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});