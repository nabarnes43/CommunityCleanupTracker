const {firebase, User, Markers, storage} = require('./config');
const { Readable } = require('stream'); // Required to handle buffer streaming
const multer = require('multer');


const storage = getStorage();
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for multer



// Get all users
const getAllUsers = async (req, res) => {
  try {
    const snapshot = await User.get();
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(list);
  } catch (error) {
    res.status(500).send({ msg: "Failed to fetch users", error: error.message });
  }
};

// Create a new user
const createUser = async (req, res) => {
  const { name, college, age } = req.body;

  if (!name || !college || !age) {
    return res.status(400).send({ msg: "Name, College, and Age are required" });
  }

  const userData = {
    name,
    college,
    age: parseInt(age, 10),
  };

  try {
    await User.add(userData);
    res.send({ msg: "User Added" });
  } catch (error) {
    res.status(500).send({ msg: "Failed to add user", error: error.message });
  }
};

// Update an existing user
const updateUser = async (req, res) => {
  const { id, name, college, age } = req.body;

  if (!id) {
    return res.status(400).send({ msg: "User ID is required" });
  }

  const updatedData = {
    name,
    college,
    age: parseInt(age, 10),
  };

  try {
    await User.doc(id).update(updatedData);
    res.send({ msg: "Updated" });
  } catch (error) {
    res.status(500).send({ msg: "Failed to update user", error: error.message });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).send({ msg: "ID is required" });
  }

  try {
    await User.doc(id).delete();
    res.send({ msg: "Deleted" });
  } catch (error) {
    res.status(500).send({ msg: "Failed to delete user", error: error.message });
  }
};

// Function to fetch all markers from Firestore
const getAllMarkers = async (req, res) => {
  try {
    const snapshot = await Markers.get(); // Fetch all documents in the 'Markers' collection
    const markers = snapshot.docs.map(doc => {
      const data = doc.data();
      const marker = {
        location: [data.location.latitude, data.location.longitude], // Convert Firestore GeoPoint to location array
        moodNotes: data.moodNotes || null,
        date: data.date instanceof firebase.firestore.Timestamp ? data.date.toDate() : data.date || null, // Safely convert Firestore timestamp
        notes: data.notes || null,
        formType: data.formType || null
      };

      // Add fields based on formType
      if (data.formType === 'Dumping') {
        marker.dumpingDetails = {
          typeOfDumping: data.dumpingDetails?.typeOfDumping || null,
          locationOfDumping: data.dumpingDetails?.locationOfDumping || null,
          amountOfDumping: data.dumpingDetails?.amountOfDumping || null,
        };
      } else if (data.formType === 'StandingWater') {
        marker.standingWaterDetails = {
          weatherCondition: data.standingWaterDetails?.weatherCondition || null,
          standingWaterLocation: data.standingWaterDetails?.standingWaterLocation || null,
          presenceOfMold: data.standingWaterDetails?.presenceOfMold || null,
        };
      } else if (data.formType === 'Stormwater') {
        marker.stormwaterProblemDetails = {
          stormwaterProblemLocation: data.stormwaterProblemDetails?.stormwaterProblemLocation || null,
          stormwaterProblemType: data.stormwaterProblemDetails?.stormwaterProblemType || null,
          causeOfClog: data.stormwaterProblemDetails?.causeOfClog || null,
        };
      }

      return marker;
    });

    res.status(200).json(markers); // Send the fetched markers as JSON
  } catch (error) {
    console.error('Error fetching markers:', error);
    res.status(500).send({ msg: 'Failed to fetch markers', error: error.message });
  }
};


const saveMarker = async (req, res) => {
  try {
    // Parse the location from the request body
    const { 
      formType, moodNotes, date, notes, 
      typeOfDumping, locationOfDumping, amountOfDumping, 
      weatherCondition, standingWaterLocation, presenceOfMold, 
      stormwaterProblemLocation, stormwaterProblemType, causeOfClog 
    } = req.body;

    const location = req.body.location ? JSON.parse(req.body.location) : null;
    if (!formType || !location || !location.latitude || !location.longitude) {
      return res.status(400).send({ msg: "Form type and location (latitude & longitude) are required" });
    }

    // Prepare base marker data
    const markerData = {
      formType,
      location: new firebase.firestore.GeoPoint(location.latitude, location.longitude),
      moodNotes: moodNotes || null,
      date: date || firebase.firestore.FieldValue.serverTimestamp(),
      notes: notes || null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    // Add form-specific details
    if (formType === 'Dumping') {
      markerData.dumpingDetails = { typeOfDumping, locationOfDumping, amountOfDumping };
    } else if (formType === 'StandingWater') {
      markerData.standingWaterDetails = { weatherCondition, standingWaterLocation, presenceOfMold };
    } else if (formType === 'Stormwater') {
      markerData.stormwaterProblemDetails = { stormwaterProblemLocation, stormwaterProblemType, causeOfClog };
    }

    // Upload images to Firebase Storage
    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map((file, index) => {
          const imageRef = storage.bucket().file(`markers/${Date.now()}_${index}_${file.originalname}`);

          // Create a stream to upload the file
          const bufferStream = new Readable();
          bufferStream.push(file.buffer);
          bufferStream.push(null); // End the stream

          return new Promise((resolve, reject) => {
            bufferStream
              .pipe(imageRef.createWriteStream({ contentType: file.mimetype }))
              .on('finish', async () => {
                try {
                  const publicUrl = await imageRef.getSignedUrl({
                    action: 'read',
                    expires: '03-01-2500', // Adjust as needed
                  });
                  resolve(publicUrl[0]); // Get the public URL
                } catch (error) {
                  reject(error);
                }
              })
              .on('error', (error) => reject(error));
          });
        })
      );

      markerData.images = imageUrls; // Attach image URLs to marker data
    }

    // Save marker data to Firestore
    const docRef = await Markers.add(markerData);
    res.status(201).send({ msg: "Marker Saved", id: docRef.id });
  } catch (error) {
    console.error("Error saving marker:", error);
    res.status(500).send({ msg: "Failed to save marker", error: error.message });
  }
};


async function sendMail(req, res) {
    try{
        const accessToken = await oAuth2Client.getAccessToken();
        let token = await accessToken.token;

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                ...CONSTANTS.auth,
                accessToken: token,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            ...CONSTANTS.mailOptions,
            text: 'This is a test mail using Gmail API'
        };

        const result = await transport.sendMail(mailOptions);
        res.send(result);
    }
    catch(error){
        console.log(error);
        res.send(error);
    }
}

async function getMails(req, res) {
    try{
        const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/threads?maxResults=100`;
        const { token } = await oAuth2Client.getAccessToken();
        const config = createConfig(url, token);
        const response = await axios(config);
        res.json(response.data);
    }
    catch(error){
        console.log(error);
        res.send(error);
    }
}

// API Test
const apiTest = (req, res) => {
  res.json({ "users": ["userOne", "userTwo", "userThree", "userFour"] });
};

// Export all controller functions
module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllMarkers,
  saveMarker,
  sendMail,
  getMails,
  apiTest
};
