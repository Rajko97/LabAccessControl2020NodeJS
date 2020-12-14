const jwt = require("jsonwebtoken");
const arp = require("../controller/arp");
const doorLock = require("../controller/door-lock");
const constants = require("../controller/constants");
const currentlyInLab = require("../controller/currentlyInLab");

//SOCKET ROUTES:
module.exports = {
  handleRequests: io => {
    io.sockets.on("connection", socket => {
      /**
       * Unlocks the door
       * * @param
       * "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e..." => {MACAddress: "", rank: ""}
       * *@returns
       * toSender {message: ""} [Unlocked | Locked | DoorIsBusy | WrongNetwork | InvalidToken | BadRequest]
       * toAll {message: ""} [Unlocked | Locked]
       */
      socket.on("unlock-req", token => {
        attemptToUnlock(token, (err, onUnlocked) => {
          if (err) {
            return io.to(socket.id).emit("unlock-res", { message: err });
          }
          io.emit("unlock-res", {
            time: constants.durationOpenDoor,
            message: "Unlocked"
          });
          onUnlocked
            .then(() => {
              io.emit("unlock-res", { message: "Locked" });
            })
            .catch(() => {
              return io
                .to(socket.id)
                .emit("unlock-res", { message: "DoorIsBusy" });
            });
        });
      });
      /**
       * CheckIn
       * * @param
       * "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e..." => {MACAddress: "", rank: ""}
       * * @returns
       * toSender {message: ""} => [WrongNetork | InvalidToken | BadRequest]
       * toAll {message: "username", data: {username, name, lastName, rank}}
       */
      let tokenForDisconnect;
      socket.on("checkIn", async token => {
        tokenForDisconnect = token;
        currentlyInLab.checkIn(token, (err, userId, userData) => {
          if (err)
            return io.to(socket.id).emit("checkIn-res", { message: err });
          io.emit("checkIn-res", { message: "success", data : userData});
          currentlyInLab.startMonitoringUser(token, (err, userId) => {
            if (userId) {
              currentlyInLab.checkOut(token, (err, res) => {});
              io.emit("checkOut-res", { message: userId });
            }
          });
        });
      });
      /**
       * CheckOut
       * @param
       * "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e..." => {MACAddress: "", "rank"}
       * * @returns
       * toSender {message: ""} => [WrongNetork | InvalidToken | BadRequest]
       * toAll {message: "12:34:56:78:9A"}
       */
      socket.on("checkOut", token => {
        currentlyInLab.checkOut(token, (err, user) => {
          if (err)
            return io.to(socket.id).emit("checkOut-res", { message: err });
          //tokenForDisconnect = null;
          io.emit("checkOut-res", { message: user});
        });
      });
      /** Returns list of users in lab
       * @param
       * * NONE
       * @returns
       * toSender: [{userId:"username", name, lastName, rank}... ] or [] if empty
       */
      socket.on("getActiveMembers", () => {
        currentlyInLab.getAllUsersInLab()
        .then(data => {
          io.to(socket.id).emit(
            "getActiveMembers-res",
            data
          );
        })
      });

      /**Tells everyone that someone disconnected
       * @param 
       * * NONE
       * @returns
       * toEveryone: {message: username}
      */
      socket.on("disconnect", socket => {
        if (!tokenForDisconnect) return;
        currentlyInLab.checkOut(tokenForDisconnect, (err, user) => {
          if (err) return;
          tokenForDisconnect = null;
          io.emit("checkOut-res", { message: user });
        });
      });
    });
  }
};

function attemptToUnlock(token, callback) {
  let errMessage;
  if (token) {
    let decoded;
    try {
      decoded = jwt.verify(token, constants.jwtSecret);
    } catch (e) {}
    if (decoded) {
      if (arp.isConnected(decoded.MACAddress)) {
        return callback(errMessage, doorLock.unlock());
      } else {
        errMessage = "WrongNetwork";
      }
    } else {
      errMessage = "InvalidToken";
    }
  } else {
    errMessage = "BadRequest";
  }
  return callback(errMessage, null);
}
