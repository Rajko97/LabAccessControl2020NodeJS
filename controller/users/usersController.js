const usersModel = require("../../model/users");
const constants = require("../../controller/constants");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const socket = require("../socket");
const firebase = require("../firebase");

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

  await deleteFirebaseToken(username);
  if(MACAddress === user.MACAddress || user.rank == "coordinator") {
    user["doorPermission"] = true;
    if(MACAddress !== user.MACAddress) {
      saveNewMac(username, MACAddress);
    }
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

const deleteFirebaseToken = async (username) => {
  await usersModel.collection.updateOne({username:username}, {$unset: {firebaseToken:"", notificationApprovedFailedToSend:""}});
}

const saveNewMac = (username, newMACAddress) => {
  usersModel.collection.updateOne({username:username}, {$set: {MACAddress:newMACAddress}});
}

const saveRequestedMac = (username, newMACAddress) => {
  usersModel.collection.updateOne({username:username}, {$set: {requestedMACAddress: newMACAddress}});
  const io = socket.getio()
  io.emit("newMacRequest", {username, newMACAddress});
};

const approveRequestedMac = (username, callback) => {
  usersModel.collection.updateOne({username:username}, {$rename: {requestedMACAddress : 'MACAddress'}}, (err, data) => {
    callback(err);
    getMatchingUserByUsername(username).then(data => {
      if(!data.firebaseToken) {
        usersModel.collection.updateOne({username:username}, {$set: {notificationApprovedFailedToSend: true}});
        return;  
      }
      firebase.sendApproveNotificationTo(data.firebaseToken)
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

const updateFireBaseToken = async (token, newToken, callback) => {
  let decoded;
  try {
    decoded = jwt.verify(token, constants.jwtSecret);
  } catch (e) {
    return callback("InvalidToken");
  }
  if (!decoded)
    return callback("InvalidToken")
  
  await checkForUnsentFirebaseNotification(decoded.username, newToken);
  usersModel.collection.updateOne({username:decoded.username}, {$set: {firebaseToken: newToken}});
  return callback(null);
}

const checkForUnsentFirebaseNotification = async (username, newToken) => {
  let user;
  try {
    user = await getMatchingUserByUsername(username);
  } catch (e) {
    return;
  }
  if (!user) {
    return;
  }
  if(!user.firebaseToken) {
    if(user.notificationApprovedFailedToSend) {
      firebase.sendApproveNotificationTo(newToken);
      await usersModel.collection.updateOne({username:username}, {$unset: {notificationApprovedFailedToSend:""}});
    }
  }
}

module.exports = {
  attemptLogin: attemptLogin,
  findMatchingUserByMACAddress: getMatchingUserByMACAddress,
  getAllMACChangeRequests : getAllMACChangeRequests,
  approveRequestedMac : approveRequestedMac,
  rejectRequestedMac : rejectRequestedMac,
  updateFireBaseToken : updateFireBaseToken
};
