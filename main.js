
let {Cu} = require("chrome");
Cu.import("resource://gre/modules/Services.jsm");
let adb = require("./adb");
const events = require("sdk/event/core");

const {devtools} = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});
const devtoolsRequire = devtools.require;
const {ConnectionManager} = devtoolsRequire("devtools/client/connection-manager");
let {Devices} = Cu.import("resource://gre/modules/devtools/Devices.jsm");

adb.start().then(function () {
  adb.trackDevices();
});

function onDeviceConnected(device) {
  console.log("ADBHELPER - CONNECTED: " + device);
  Devices.register(device, {
    connect: function () {
      let port = ConnectionManager.getFreeTCPPort();
      adb.forwardPort("tcp:" + port, "localfilesystem:/data/local/debugger-socket");
      return port;
    }
  });
}

events.on(adb, "device-connected", onDeviceConnected);

events.on(adb, "device-disconnected", function (device) {
  console.log("ADBHELPER - DISCONNECTED: " + device);
  Devices.unregister(device);
});