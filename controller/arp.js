const arp = require("@network-utils/arp-lookup");

let macDevices = [];
updateMacList();
setInterval(updateMacList, 5000);

function updateMacList() {
  arp.getTable().then(data => {
    macDevices = data.map(element => element["mac"]);
  });
}

module.exports = {
  isConnected: mac => {
    return macDevices.includes(mac);
  }
};
