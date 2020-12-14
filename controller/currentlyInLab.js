const arp = require("./arp");
const jwt = require("jsonwebtoken");
const constants = require("./constants");
const findUserDataByMacAddress = require("./users/usersController").findMatchingUserByMACAddress

let users = []; /*MacAddresses*/
let cronJobs = []; /*[{job: "", MacAddress: ""} ]*/

module.exports = {
  startMonitoringUser: (token, callback) => {
    let decoded;
    try {
      decoded = jwt.verify(token, constants.jwtSecret);
    } catch (e) {
      return callback("InvalidToken", null);
    }
    if (
      cronJobs.map(element => element.MACAddress).includes(decoded.MACAddress)
    ) {
      return callback("AlreadyMonitoring", null);
    }
    let interval = setInterval(() => {
      if (!users.includes(decoded.MACAddress)) {
        clearInterval(interval);
        cronJobs = cronJobs.filter(
          elem => elem.MACAddress != decoded.MACAddress
        );
        return callback("NotFound", null);
      }

      if (!arp.isConnected(decoded.MACAddress)) {
        clearInterval(interval);
        cronJobs = cronJobs.filter(elem => elem != decoded.MACAddress);
        callback(null, decoded.MACAddress);
      }
    }, constants.cronJobRefreshArpTime);
    cronJobs.push({
      job: interval,
      MACAddress: decoded.MACAddress
    });
  },
  checkIn: async (token, callback) => { let decoded;
    try {
      decoded = jwt.verify(token, constants.jwtSecret);
    } catch (e) {
      return callback("InvalidToken", null);
    }
    if (users.some(elem => elem === decoded.MACAddress)) {
      return callback("AlreadyIn", null);
    }
    if (!arp.isConnected(decoded.MACAddress)) {
      return callback("WrongNetwork", null);
    }
    if(decoded.rank === "coordinator") {
      users.unshift(decoded.MACAddress);
    } else {
      users.push(decoded.MACAddress)
    }
    try {
      let userData = (({username, name, lastName, rank}) => ({username, name, lastName, rank})) (await findUserDataByMacAddress(decoded.MACAddress));
      return callback(false, decoded.username, userData)
    } catch(err) {
      return callback("UnknownPerson", null);
    }
  },
  checkOut: (token, callback) => {
    let decoded;
    try {
      decoded = jwt.verify(token, constants.jwtSecret);
    } catch (e) {
      return callback("InvalidToken", null);
    }
    const length = users.length;
    users = users.filter(item => item != decoded.MACAddress);
    return callback(
      length != users.length ? false : "NotFound",
      decoded.username
    );
  },
  getAllUsersInLab: () => {
    return new Promise(async (res, rej) => {
      await Promise.all(users.map((user) => findUserDataByMacAddress(user)))
      .then(data => { res(data.map(({username, name, lastName, rank}) => ({userId:username, name, lastName, rank})))})
      .catch(err => { res([]) })
    });
  }
};
