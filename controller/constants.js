const MONGODB_DN_NAME = "labAccessControl";
const MONGODB_URL = "mongodb://localhost:27017/";

const SAMSUNG_APPS_LAB_ROUTER_MAC_ADDRESS = "14:5F:94:F5:0B:EC" // Local for testing

module.exports = {
  durationOpenDoor: 4000,
  mongodbUrlDB: MONGODB_URL,
  mongodbName: MONGODB_DN_NAME,
  jwtSecret: "youShouldNotKnowThis -.-' ",
  cronJobRefreshArpTime: 5000,
  samsungAppsLabRouterMacAddress : SAMSUNG_APPS_LAB_ROUTER_MAC_ADDRESS
};
