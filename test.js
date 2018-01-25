
var foo = require('node-tradfri-client');
var Path             = require('path');


var tradfri = new foo.TradfriClient('192.168.86.78');
require('dotenv').config({path: Path.join(process.env.HOME, '.homebridge/.env')});



tradfri.connect('Client_identity', process.env.IKEA_TRADFRI_PSK).then((kalle) => {

    setTimeout(() => {

    }, 3000)

    tradfri
        .on("device updated", tradfri_deviceUpdated)
        .on("device removed", tradfri_deviceRemoved)
        .observeDevices()
    ;
    const lightbulbs = {};
    function tradfri_deviceUpdated(device) {

        if (device.name == 'Taket') { //true || device.type == foo.AccessoryTypes.lightbulb) {
            // remember it
            console.log(device.name, device.instanceId); //, device.client.devices);
            console.log('*********************************');
            console.log(device.lightList[0]); //, device.client.devices);
            console.log('*********************************');
        }
    }

    function tradfri_deviceRemoved(instanceId) {
        // clean up
    }
});
