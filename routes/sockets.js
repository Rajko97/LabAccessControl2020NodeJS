const jwt = require("jsonwebtoken");
const arp = require("../controller/arp");
const doorLock = require("../controller/door-lock");
const constants = require("../controller/constants");

//SOCKET ROUTES:
module.exports = {
  handleRequests: io => {
    io.sockets.on("connection", socket => {
      /**
       * Unlocks the door
       * * @param
       * "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e..."
       */
      socket.on("unlock-req", data => {
        attemptToUnlock(data, (err, onUnlocked) => {
          if (err) {
            return io.to(socket.id).emit("unlock-res", { message: err });
          }
          socket.emit("unlock-res", {
            time: constants.durationOpenDoor,
            message: "Unlocked"
          });
          onUnlocked
            .then(() => {
              socket.emit("unlock-res", { message: "Locked" });
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
       * "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e..."
       */
      socket.on("checkIn", data => {
        onCheckIn(io, socket, data);
      });
      socket.on("checkOut", data => {
        onCheckOut(io, socket, data);
      });
      socket.on("getActiveMembers", data => {
        onGetActiveMembers(io, socket, data);
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
