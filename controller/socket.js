const arp = require("./arp");

let isDoorLocked = 1;
let io;

function onUnlockRequestEvent(socket, data) {
  let errMessage = "";
  if (data) {
    if (isDoorLocked) {
      if (arp.isConnected(data)) {
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
