const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const usersModel = require("../model/users");

router.post("/", [
  check("username")
    .not()
    .isEmpty(),
  check("password").isLength({ min: 6 }),
  check("MACAddress").isMACAddress(),
  (req, res, next) => handleRequest(req, res, next)
]);

function handleRequest(req, res, next) {
  if (!validationResult(req).isEmpty()) {
    return res.status(400).send(BadRequest);
  }

  const { username, password, MACAddress } = req.body;
  usersModel.findOne({ username: username }, (err, user) => {
    if (err) {
      return res.status(503).send(DBServiceUnavailable);
    }
    if (!user) {
      return res.status(400).send("IncorrectUsernameOrPassword");
    }
    user = JSON.parse(JSON.stringify(user));
    delete user["_id"];
    if (password != user.password) {
      return res.status(400).send("IncorrectUsernameOrPassword");
    }
    delete user["password"];
    if (MACAddress !== user.mac) {
      return res.status(401).send("UnauthorzedDevice");
    }
    user["token"] = "123456789";
    return res.json(user);
  });
}

module.exports = router;
