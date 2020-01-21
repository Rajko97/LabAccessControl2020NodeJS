var express = require("express");
var router = express.Router();
var usersController = require("../controller/users/usersController");

router.get("/", async function(req, res, next) {
  const requestList = await usersController.getAllMACChangeRequests();
  console.log(requestList);
  res.render("index", { title: "Express", requestList:requestList});
});

module.exports = router;
