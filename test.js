
var Ikea = require('node-tradfri-client');
var Path = require('path');

require('dotenv').config({path: Path.join(process.env.HOME, '.homebridge/.env')});


var gateway = new Ikea.TradfriClient('192.168.86.78');

gateway.connect('Client_identity', process.env.IKEA_TRADFRI_PSK).then((connected) => {

    console.log('Connected.');

    gateway.on("device updated", (device) => {
        console.log(device.name, device.instanceId);
        if (device.instanceId == 65536) {
//            console.log(device);
        }
    });

    gateway.on("group updated", (group) => {
        //console.log(group);
    });

    gateway.on("scene updated", (group, scene) => {
        //console.log(group, scene);
    });

    gateway.observeDevices().then(() => {
        return gateway.observeGroupsAndScenes();

    })
    .then(() => {
        console.log(gateway.devices[65537]);
    });
});
