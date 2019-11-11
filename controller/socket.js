const arp = require("./arp");
const jwt = require("jsonwebtoken");

let isDoorLocked = 1;
let io;

function onUnlockRequestEvent(socket, token) {
  let errMessage = "";
  if (token) {
    if (isDoorLocked) {
      let decoded;
      try {
        decoded = jwt.verify(token, "Psst!ThisIsASecret");
      } catch (e) {

      }
      if(decoded) {
        if (arp.isConnected(decoded.MACAddress)) {
          isDoorLocked = 0;
          socket.emit("unlock-res", { time: 4000, message: "Unlocked" });
          //ToDo set pin 11 HIGH
          setTimeout(() => {
            isDoorLocked = 1;
            //ToDo set pin 11 LOW
            socket.emit("unlock-res", { time: null, message: "Locked" });
          }, 4000);
          return;
        } else {
          errMessage = "WrongNetwork";
        }
      } else {
        errMessage = "InvalidToken";
      }
    } else {
      errMessage = "DoorIsBusy";
    }
  } else {
    errMessage = "BadRequest";
  }
  io.to(socket.id).emit("unlock-res", { message: errMessage });
}

module.exports = {
  init: server => {
    io = require("socket.io").listen(server);
    io.sockets.on("connection", socket => {
      socket.on("unlock-req", data => {
        onUnlockRequestEvent(socket, data);
      });
    });
    return io;
  },
  getio: () => {
    return io;
  }
};
