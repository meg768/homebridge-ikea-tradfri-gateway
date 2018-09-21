#!/usr/bin/env node

var Path = require('path');
var fs   = require('fs');

function install() {

    var homebridgeConfig = Path.join(process.env.HOME, '.homebridge/config.json');
    var thisConfig = Path.join('.', 'config.json');

    var homebridge = JSON.parse(fs.readFileSync(homebridgeConfig));
    var config = JSON.parse(fs.readFileSync(thisConfig));

    if (!homebridge.accessories)
        homebridge.accessories = [];

    if (!homebridge.platforms)
        homebridge.platforms = [];

    config.accessories.forEach((accessory) => {

        // Remove existing
        homebridge.accessories = homebridge.accessories.filter((item) => {
            return item.accessory.toLowerCase() != accessory.accessory.toLowerCase();
        });

        // And add this one
        homebridge.accessories.push(accessory);

    });

    config.platforms.forEach((platform) => {

        // Remove existing platform from homebridge
        homebridge.platforms = homebridge.platforms.filter((item) => {
            return item.platform.toLowerCase() != platform.platform.toLowerCase();
        });

        // And add this one
        homebridge.platforms.push(platform);

    });


    fs.writeFileSync(homebridgeConfig, JSON.stringify(homebridge, null, '    '));
}

install();
