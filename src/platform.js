"use strict";

var Events           = require('events');
var Path             = require('path');
var isObject         = require('yow/is').isObject;
var isString         = require('yow/is').isString;
var isFunction       = require('yow/is').isFunction;
var sprintf          = require('yow/sprintf');
var isString         = require('yow/is').isString;
var Timer            = require('yow/timer');

var Lightbulb          = require('./lightbulb.js');
var WarmWhiteLightbulb = require('./warm-white-lightbulb.js');
var RgbLightbulb       = require('./rgb-lightbulb.js');
var Ikea               = require('node-tradfri-client');


var Accessory, Service, Characteristic, UUIDGen;


module.exports = class Platform  {

    constructor(log, config, homebridge) {

        if (config.host == undefined)
            throw new Error('Must specify a host in ~/.homebridge/config.json.');

        this.config         = config;
        this.log            = log;
        this.homebridge     = homebridge;
        this.tradfri        = new Ikea.TradfriClient(config.host);
        this.devices        = {};
        this.timestamp      = new Date();

        Accessory = homebridge.platformAccessory;
        Service = homebridge.hap.Service;
        Characteristic = homebridge.hap.Characteristic;
        UUIDGen = homebridge.hap.uuid;

        // Load .env
        require('dotenv').config({path: Path.join(process.env.HOME, '.homebridge/.env')});


        this.homebridge.on('didFinishLaunching', () => {
            this.log('didFinishLaunching');
        });

        if (process.env.IKEA_TRADFRI_PSK)
            config.psk = process.env.IKEA_TRADFRI_PSK;

        if (process.env.IKEA_TRADFRI_IDENTITY)
            config.identity = process.env.IKEA_TRADFRI_IDENTITY;

        if (config.psk == undefined)
            throw new Error('A pre-shared key (psk) must be specified in ~/.homebridge/config.json.')

        if (config.identity == undefined)
            config.identity = 'Client_identity';

    }

    connect() {
        return new Promise((resolve, reject) => {
            this.log('Connecting...');
            this.tradfri.connect(this.config.identity, this.config.psk).then((connected) => {
                if (connected)
                    return Promise.resolve();
                else
                    reject(new Error('Could not connect.'));
            })
            .then(() => {
                this.log('Loading devices...');
                return this.tradfri.observeDevices();
            })
            .then(() => {
                this.log('Done.');
                resolve();
            })
            .catch((error) => {
                reject(error);
            })
        });
    }


    setup() {
        return new Promise((resolve, reject) => {
            for (var id in this.tradfri.devices) {
                var device = this.tradfri.devices[id];

                if (device.type === Ikea.AccessoryTypes.lightbulb) {

                    this.log('Creating accessory \'%s\'...', device.name);

                    var bulb = undefined;

                    switch(device.lightList[0]._spectrum) {
                        case 'white': {
                            bulb = new WarmWhiteLightbulb(this, device);
                            break;
                        }
                        case 'rgb': {
                            bulb = new RgbLightbulb(this, device);
                            break;
                        }
                        default: {
                            bulb = new Lightbulb(this, device);
                            break;
                        }
                    }

                    this.devices[device.instanceId] = bulb;
                    this.devices[device.instanceId].emit('changed', device);
                }
            }

            this.tradfri.on("device updated", (device) => {
                if (this.devices[device.instanceId] != undefined)
                    this.devices[device.instanceId].emit('changed', device);
            });

            resolve();
        });


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
            throw error;
        })


    }


}
