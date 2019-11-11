const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const usersModel = require("../model/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const constants = require("../controller/constants");

router.post("/", [
  check("username")
    .not()
    .isEmpty(),
  check("password").isLength({ min: 6 }),
  check("MACAddress").isMACAddress(),
  async (req, res, next) => await handleRequest(req, res, next)
]);

async function handleRequest(req, res, next) {
  if (!validationResult(req).isEmpty()) {
    return res.status(400).send(BadRequest);
  }

  const { username, password, MACAddress } = req.body;

  let user;
  try {
    user = await getMatchingUser(username);
  } catch (e) {
    return res.status(503).send(DBServiceUnavailable);
  }
  if (user) {
    user = JSON.parse(JSON.stringify(user));
    delete user["_id"];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      delete user["password"];
      if (MACAddress === user.MACAddress) {
        user["token"] = jwt.sign(
          { MACAddress: MACAddress, rank: user.rank },
          constants.jwtSecret
        );
        return res.json(user);
      } else {
        return res.status(401).send("UnauthorzedDevice");
      }
    } else {
      return res.status(400).send("IncorrectUsernameOrPassword");
    }
  } else {
    return res.status(400).send("IncorrectUsernameOrPassword");
  }
}

function getMatchingUser(username) {
  return new Promise(function(resolve, reject) {
    usersModel.findOne({ username: username }, (err, user) => {
      if (err) {
        reject(err);
      }
      resolve(user);
    });
  });
}
module.exports = router;
