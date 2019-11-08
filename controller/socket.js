//const gpio = require("pi-gpio");
let isDoorLocked = 1;
let io;

function onUnlockRequestEvent(socket, data) {
  if (!data || !isDoorLocked) {
    io.to(socket.id).emit("unlock-res", { message: "Error" });
    return;
  }

  isDoorLocked = 0;
  socket.emit("unlock-res", { time: 4000, message: "Unlocked" });
  //ToDo set pin 11 HIGH
  setTimeout(() => {
    isDoorLocked = 1;
    //ToDo set pin 11 LOW
    socket.emit("unlock-res", { time: null, message: "Locked" });
  }, 4000);
}

module.exports = {
  init: function(server) {
    io = require("socket.io").listen(server);

    io.sockets.on("connection", socket => {
      socket.on("unlock-req", data => {
        onUnlockRequestEvent(socket, data);
      });
    });
    return io;
  },
  getio: function() {
    return io;
  }
};
