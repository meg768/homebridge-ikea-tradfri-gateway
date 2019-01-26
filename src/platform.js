"use strict";

var Events           = require('events');
var Path             = require('path');
var isObject         = require('yow/is').isObject;
var isString         = require('yow/is').isString;
var isFunction       = require('yow/is').isFunction;
var sprintf          = require('yow/sprintf');
var isString         = require('yow/is').isString;
var isArray          = require('yow/is').isArray;
var Timer            = require('yow/timer');

var Lightbulb          = require('./lightbulb.js');
var WarmWhiteLightbulb = require('./warm-white-lightbulb.js');
var RgbLightbulb       = require('./rgb-lightbulb.js');
var Outlet             = require('./outlet.js');
var Gateway            = require('./gateway.js');
var Ikea               = require('node-tradfri-client');


var Accessory, Service, Characteristic, UUIDGen;


module.exports = class Platform extends Gateway {

    constructor(log, config, homebridge) {

        Accessory = homebridge.platformAccessory;
        Service = homebridge.hap.Service;
        Characteristic = homebridge.hap.Characteristic;
        UUIDGen = homebridge.hap.uuid;

        super(log, config);

        this.homebridge = homebridge;
        this.devices = {};

        this.homebridge.on('didFinishLaunching', () => {
            this.log('didFinishLaunching');
        });
    }

    deviceUpdated(device) {


        var item = this.devices[device.instanceId];

        if (item != undefined) {
            item.device = device;
            item.deviceChanged();
        }
        else {
        }
    }

    groupUpdated(group) {
    }


    setup() {

        var expose = {};

        if (isArray(this.config.expose)) {
            this.config.expose.forEach((item) => {
                expose[item] = true;
            });
        }
        else {
            expose['outlets'] = true;
            expose['lightbulbs'] = true;
        }

        for (var id in this.gateway.devices) {
            var device = this.gateway.devices[id];
            var supportedDevice = undefined;

            switch (device.type) {
                case Ikea.AccessoryTypes.plug: {

                    // Make sure the device has a plugList                    
                    if (device.plugList && expose['outlets'])
                        supportedDevice = new Outlet(this, device);
                    
                    break;
                }

                case Ikea.AccessoryTypes.lightbulb: {

                    // Make sure the device has a lightList
                    if (device.lightList && expose['lightbulbs']) {
                        var spectrum = device.lightList[0]._spectrum;

                        switch(spectrum) {
                            case 'white': {
                                supportedDevice = new WarmWhiteLightbulb(this, device);
                                break;
                            }
                            case 'rgbw':
                            case 'rgb': {
                                supportedDevice = new RgbLightbulb(this, device);
                                break;
                            }
                            default: {
                                supportedDevice = new Lightbulb(this, device);
                                break;
                            }
                        }
    
                    }
    
                    break;
                }
            }

            if (supportedDevice) {
                this.devices[device.instanceId] = supportedDevice;
            }
            else {
                this.log('The following device is ignored.');
                this.log(JSON.stringify(device.deviceInfo));
            }
        }

        return Promise.resolve();

    }

    accessories(callback) {

        this.connect().then(() => {
            return this.setup();
        })
        .then(() => {
            var accessories = [];

            for (var id in this.devices) {
                accessories.push(this.devices[id]);
            }

            callback(accessories);
        })
        .catch((error) => {
            // Display error and make sure to stop.
            // If we just return an empty array, all our automation
            // rules and scenarios will be removed from the Home App.
            console.log(error);
            process.exit(1);
            throw error;
        })


    }


}
