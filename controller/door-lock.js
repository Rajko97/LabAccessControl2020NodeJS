//const gpio = require('pi-gpio');
const constants = require("../controller/constants");

let isDoorLocked = 1;

module.exports = {
  unlock: () => {
    return new Promise((res, rej) => {
      if (!isDoorLocked) rej();
      //gpio.open(11, "output", function(err) {
      //gpio.write(11, 1, function() {
      isDoorLocked = 0;
      setTimeout(() => {
        //gpio.close(11);
        isDoorLocked = 1;
        res(true);
      }, constants.durationOpenDoor);
      //});
      //});
    });
  }
};
