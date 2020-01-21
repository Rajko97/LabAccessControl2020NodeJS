const mongoose = require("mongoose");

const userScheme = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  MACAddress: {
    type: String,
  },
  requestedMACAddress : {
    type : String 
  },
  name: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  rank: {
    type: String,
    enum: [
      "vts staff",
      "unauthorized member",
      "new member",
      "senior member",
      "retired member",
      "coordinator"
    ]
  },
  memberFrom: {
    type: Date,
    default: Date.now()
  },
  firebaseToken: {
    type: String,
    required: false
  }
});

const UsersModel = mongoose.model("users", userScheme);

module.exports = UsersModel;
