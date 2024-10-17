const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllMarkers,
  saveMarker,
  sendMail,
  getMails,
  apiTest
} = require('./controller');

// Define routes and map them to controller methods
router.get('/users', getAllUsers);
router.post('/create', createUser);
router.post('/update', updateUser);
router.post('/delete', deleteUser);
router.get('/api', apiTest);

//Markers
router.get('/markers', getAllMarkers);
router.post('/createMarker', saveMarker);

//Email
router.get('/send', sendMail);
router.get('/list/:email', getMails);

module.exports = router;
