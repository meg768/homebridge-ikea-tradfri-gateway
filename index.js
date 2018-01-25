"use strict";

module.exports = function(homebridge) {
    homebridge.registerPlatform('homebridge-ikea-gateway', 'Ikea Trådfri Gateway', require('./src/platform.js'));
};
