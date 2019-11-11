const MONGODB_DN_NAME = "accessControl";
const MONGODB_URL = "mongodb://localhost:27017/";

module.exports = {
  durationOpenDoor: 4000,
  mongodbUrlDB: MONGODB_URL,
  mongodbName: MONGODB_DN_NAME,
  jwtSecret: "youShouldNotKnowThis -.-' "
};
