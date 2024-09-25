const User = require('./config');

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
  sendMail,
  getMails,
  apiTest
};
