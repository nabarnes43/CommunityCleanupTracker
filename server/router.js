const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

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
//router.post('/createMarker', saveMarker);
router.post('/createMarker', upload.array('images', 5), async (req, res) => {
  console.log('Incoming Body:', req.body); // Log parsed body
  console.log('Incoming Files:', req.files); // Log uploaded files

  try {
    await saveMarker(req, res);
  } catch (error) {
    console.error('Error handling createMarker:', error);
    res.status(500).send({ msg: 'Failed to save marker', error: error.message });
  }
});

//Email
router.get('/send', sendMail);
router.get('/list/:email', getMails);

module.exports = router;
