// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./router'); // Import user routes

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Use user routes
app.use('/user', routes); // All routes under '/api' will be handled by userRoutes

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Up & Running on port ${PORT}`);
});
