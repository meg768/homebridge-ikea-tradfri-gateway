
var Ikea = require('node-tradfri-client');
var Path = require('path');

require('dotenv').config({path: Path.join(process.env.HOME, '.homebridge/.env')});


var Gateway = require('./src/gateway.js')
var ikea = new Gateway({
    log: console.log,
    host: 'gw-b8d7af2a9d45'
});

ikea.gateway.connect().then(() => {

    console.log(ikea.gateway);


    var device = ikea.gateway.devices[65562];
    console.log('Device %s (%s)', device.instanceId, device.name);

})
.catch((error) => {
    console.log(error);
});
