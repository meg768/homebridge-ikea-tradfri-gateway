"use strict";

var Path = require('path');

module.exports = function(homebridge) {

    // Load .env
    require('dotenv').config({path: Path.join(process.env.HOME, '.homebridge/.env')});

    homebridge.registerPlatform('homebridge-ikea-gateway', 'Ikea Trådfri Gateway', require('./src/platform.js'));
};
