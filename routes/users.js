const express = require("express");
const router = express.Router();
const userController = require("../controller/users/usersController");

router.post("/login", (req, res, next) => {
  req.checkBody("username", "username is required").notEmpty();
  req.checkBody("password", "password is required").notEmpty();
  req.checkBody("MACAddress", "MACAddress required").notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send("BadRequest");
  }

  const { username, password, MACAddress } = req.body;
  userController.attemptLogin(username, password, MACAddress, (err, user) => {
    if (err) {
      if (err === "mac") {
        return res.status(401).send("UnauthorzedDevice");
      }
      if (err === "user" || err === "password") {
        return res.status(400).send("IncorrectUsernameOrPassword");
      }
      if (err === "") {
        return res.status(503).send("DBServiceUnavailable");
      }
    }
    res.json(user);
  });
});

module.exports = router;
