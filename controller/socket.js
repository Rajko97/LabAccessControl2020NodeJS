const router = require("../routes/sockets");

let io;

module.exports = {
  init: server => {
    io = require("socket.io").listen(server);
    router.handleRequests(io);
    return io;
  },
  getio: () => {
    return io;
  }
};
