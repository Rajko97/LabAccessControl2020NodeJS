let io;

module.exports = {
  init: (server, router) => {
    io = require("socket.io").listen(server);
    router.handleRequests(io);
    return io;
  },
  getio: () => {
    return io;
  }
};
