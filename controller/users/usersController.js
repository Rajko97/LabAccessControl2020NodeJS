const usersModel = require("../../model/users");
const constants = require("../../controller/constants");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const socket = require("../socket");
const admin = require("firebase-admin");

const attemptLogin = async function(username, password, MACAddress, callback) {
  //console.log(bcrypt.hashSync("vts2020", 10))
  let user;
  try {
    user = await getMatchingUserByUsername(username);
  } catch (e) {
    return callback("db", null); //throw e
  }
  if (!user) {
    return callback("user", null);
  }
  const isPasswordMatching = await bcrypt.compare(password, user.password);
  if (!isPasswordMatching) {
    return callback("password", null);
  }

  delete user["_id"];
  delete user["password"];
  user["uniqueToken"] = jwt.sign(
    {username:user.username, MACAddress: MACAddress, rank: user.rank },
    constants.jwtSecret
  );

  if(MACAddress === user.MACAddress) {
    user["doorPermission"] = true;
  } else {
    user["doorPermission"] = false;
    saveRequestedMac(username, MACAddress);
  }
  user["samsungAppsLabRouterMacAddress"] = constants.samsungAppsLabRouterMacAddress;
  callback(null, user);
};

const getMatchingUserByUsername = username => {
  return new Promise(function(resolve, reject) {
    usersModel.findOne({ username: username }, (err, user) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(JSON.stringify(user)));
    });
  });
};

const getMatchingUserByMACAddress = MACAddress => {
  return new Promise(function(resolve, reject) {
    usersModel.findOne({ MACAddress: MACAddress }, (err, user) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(JSON.stringify(user)));
    });
  });
};

const saveRequestedMac = (username, newMACAddress) => {
  usersModel.collection.updateOne({username:username}, {$set: {requestedMACAddress: newMACAddress}});
  const io = socket.getio()
  io.emit("newMacRequest", {username, newMACAddress});
};

const approveRequestedMac = (username, callback) => {
  usersModel.collection.updateOne({username:username}, {$rename: {requestedMACAddress : 'MACAddress'}}, (err, data) => {
    callback(err);
    getMatchingUserByUsername(username).then(data => {
      // admin.messaging().sendToDevice(data.firebaseToken, {data: {data1:"Hello"}}, {priority: "high", timeToLive: 60*60*24})
      //   .then(response => {
      //     console.log("success sent message", response);
      //   })
      //   .catch(error => {
      //     console.log("Error sending:", error);
      //   });
      const message = {
        /*notification: {
          title: "VTŠ Apps Team",
          body: "Vaš uređaj je odobren. Možete da koristite aplikaciju!"
        },*/
        data: {
          "access": "true"
        }
      }
      admin.messaging().sendToDevice(data.firebaseToken, message)
        .then(data => {
          console.log("succ sent: ", data);
        })
        .catch(err => {
          console.log("err ", err)
        });
    });
  });
}

const rejectRequestedMac = (username, callback) => {
  usersModel.collection.updateOne({username:username}, {$unset: {requestedMACAddress:""}}, (err, result) => {
    callback(err);
  })
};

const getAllMACChangeRequests = () => {
  return new Promise((res, rej) => {
    usersModel.find({requestedMACAddress : {$exists: true}}, (err, list) => {
      if(err) {
        list = [];
      }
      res(list.map( elem => { return {username : elem.username, requestedMACAddress: elem.requestedMACAddress}}));
    });
  });
};

const updateFireBaseToken = (token, newToken, callback) => {
  let decoded;
  try {
    decoded = jwt.verify(token, constants.jwtSecret);
  } catch (e) {
    return callback("InvalidToken");
  }
  if (!decoded)
    return callback("InvalidToken")

  usersModel.collection.updateOne({username:decoded.username}, {$set: {firebaseToken: newToken}});
  return callback(null);
}

module.exports = {
  attemptLogin: attemptLogin,
  getMatchingUserByMACAddress: getMatchingUserByMACAddress,
  getAllMACChangeRequests : getAllMACChangeRequests,
  approveRequestedMac : approveRequestedMac,
  rejectRequestedMac : rejectRequestedMac,
  updateFireBaseToken : updateFireBaseToken
};
