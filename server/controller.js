const {admin, User, Markers, storage} = require('./config');
const { Readable } = require('stream'); // Required to handle buffer streaming
const multer = require('multer');

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
    const snapshot = await Markers.get();
    
    const markers = snapshot.docs.map((doc) => {
      const data = doc.data();
      const marker = {
        id: doc.id,
        location: [data.location.latitude, data.location.longitude],
        title: `${data.formType} Report`, // Add a title
        description: data.notes || 'No description provided', // Use notes as description
        moodNotes: data.moodNotes || null,
        images: data.images || [], // Include the image URLs array
        date: data.date instanceof admin.firestore.Timestamp ? data.date.toDate() : data.date || null,
        formType: data.formType || null,
        details: {} // Store form-specific details
      };

      // Add form-specific details
      if (data.formType === "Dumping") {
        marker.details = data.dumpingDetails || {};
        marker.description = `Type: ${data.dumpingDetails?.typeOfDumping || 'N/A'}\nLocation: ${data.dumpingDetails?.locationOfDumping || 'N/A'}\nAmount: ${data.dumpingDetails?.amountOfDumping || 'N/A'}\n${marker.description}`;
      } else if (data.formType === "StandingWater") {
        marker.details = data.standingWaterDetails || {};
        marker.description = `Weather: ${data.standingWaterDetails?.weatherCondition || 'N/A'}\nLocation: ${data.standingWaterDetails?.standingWaterLocation || 'N/A'}\nMold: ${data.standingWaterDetails?.presenceOfMold || 'N/A'}\n${marker.description}`;
      } else if (data.formType === "Stormwater") {
        marker.details = data.stormwaterProblemDetails || {};
        marker.description = `Location: ${data.stormwaterProblemDetails?.stormwaterProblemLocation || 'N/A'}\nProblem: ${data.stormwaterProblemDetails?.stormwaterProblemType || 'N/A'}\nCause: ${data.stormwaterProblemDetails?.causeOfClog || 'N/A'}\n${marker.description}`;
      }

      return marker;
    });

    res.status(200).json(markers);
  } catch (error) {
    console.error("Error fetching markers:", error);
    res.status(500).send({ msg: "Failed to fetch markers", error: error.message });
  }
};


const saveMarker = async (req, res) => {
  try {
    const {
      location: locationString, // Location as JSON string from frontend
      formType,
      moodNotes,
      date,
      notes,
      typeOfDumping,
      locationOfDumping,
      amountOfDumping,
      weatherCondition,
      standingWaterLocation,
      presenceOfMold,
      stormwaterProblemLocation,
      stormwaterProblemType,
      causeOfClog,
    } = req.body;

    // Parse location from the request body
    const location = locationString ? JSON.parse(locationString) : null;
    if (!location || !location.latitude || !location.longitude || !formType) {
      return res.status(400).send({ msg: "Location (latitude, longitude) and form type are required" });
    }

    // Initialize marker data
    const markerData = {
      location: new admin.firestore.GeoPoint(location.latitude, location.longitude),
      formType,
      moodNotes: moodNotes || null,
      date: date || admin.firestore.FieldValue.serverTimestamp(),
      notes: notes || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Handle form-specific details
    if (formType === 'Dumping') {
      markerData.dumpingDetails = {
        typeOfDumping: typeOfDumping || null,
        locationOfDumping: locationOfDumping || null,
        amountOfDumping: amountOfDumping || null,
      };
    } else if (formType === 'StandingWater') {
      markerData.standingWaterDetails = {
        weatherCondition: weatherCondition || null,
        standingWaterLocation: standingWaterLocation || null,
        presenceOfMold: presenceOfMold || null,
      };
    } else if (formType === 'Stormwater') {
      markerData.stormwaterProblemDetails = {
        stormwaterProblemLocation: stormwaterProblemLocation || null,
        stormwaterProblemType: stormwaterProblemType || null,
        causeOfClog: causeOfClog || null,
      };
    }

    // Handle image uploads
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const bucket = admin.storage().bucket(); // Use default bucket
          const fileName = `markers/${Date.now()}_${file.originalname}`;
          const fileUpload = bucket.file(fileName);

          // Save the file to Firebase Storage
          await fileUpload.save(file.buffer, {
            metadata: { contentType: file.mimetype },
          });

          // Generate public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          uploadedImages.push(publicUrl);
        } catch (err) {
          console.error("Error uploading image:", err);
          return res.status(500).send({ msg: "Failed to upload images", error: err.message });
        }
      }
    }

    // Attach uploaded images to marker data
    if (uploadedImages.length > 0) {
      markerData.images = uploadedImages;
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
