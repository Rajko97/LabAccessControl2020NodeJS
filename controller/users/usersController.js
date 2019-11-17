const usersModel = require("../../model/users");
const constants = require("../../controller/constants");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const attemptLogin = async function(username, password, MACAddress, callback) {
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
  if (MACAddress !== user.MACAddress) {
    return callback("mac", null);
  }

  delete user["_id"];
  delete user["password"];
  user["token"] = jwt.sign(
    { MACAddress: MACAddress, rank: user.rank },
    constants.jwtSecret
  );
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

module.exports = {
  attemptLogin: attemptLogin,
  getMatchingUserByMACAddress: getMatchingUserByMACAddress
};
