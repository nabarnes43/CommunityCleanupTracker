const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
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

//Email
router.get('/send', sendMail);
router.get('/list/:email', getMails);

module.exports = router;
