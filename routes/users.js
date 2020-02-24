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
      if (err === "user") {
        return res.status(401).send("IncorrectUsername");
      }
      if(err === 'password') {
        return res.status(402).send('IncorrectPassword');
      }
      if (err === "db") {
        return res.status(503).send("DBServiceUnavailable");
      }
      return;
    }
    res.json(user);
  });
});

router.post("/approve", (req, res, next) => {
  req.checkBody("username").notEmpty();
  const errors = req.validationErrors();
  if(errors) {
    return res.status(400).send("BadRequest");
  }
  let username = req.body.username;
  userController.approveRequestedMac(username, (err) => {
    if(err) return res.status(401).send("NotFound");
    res.json({username: username});
  });
});

router.post("/reject", (req, res, next) => {
  req.checkBody("username").notEmpty();
  const errors = req.validationErrors();
  if(errors) {
    return res.status(400).send("BadRequest");
  }
  let username = req.body.username;
  userController.rejectRequestedMac(req.body["username"], (err) => {
    if(err) return res.status(401).send("NotFound");
    res.json({username:username});
  });
});

router.post('/updateFirebaseToken', (req, res, next) => {
  console.log(req.body);
  req.checkBody("token").notEmpty();
  req.checkBody("newToken").notEmpty();
  const errors = req.validationErrors();
  if(errors) {
    return res.status(400).send("BadRequest");
  }

  userController.updateFireBaseToken(req.body["token"], req.body["newToken"], (err) => {
    if (err) {
      return res.status(401).send("InvalidToken");
    }
    res.status(200).send({message:'ok'});
  });
});

module.exports = router;