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
var Ikea               = require('node-tradfri-client');


var Accessory, Service, Characteristic, UUIDGen;

class Switch  {

    constructor(platform, id, name) {


        this.uuid = platform.homebridge.hap.uuid.generate(id);
        this.name = name;
        this.log = platform.log;
        this.platform = platform;
        this.homebridge = platform.homebridge;
        this.Characteristic = platform.homebridge.hap.Characteristic;
        this.Service = platform.homebridge.hap.Service;
        this.services = [];


        var service = new this.Service.AccessoryInformation();

        service.setCharacteristic(this.Characteristic.Manufacturer, 'OLLE');

        service.setCharacteristic(this.Characteristic.Model, 'NISSE');

        service.setCharacteristic(this.Characteristic.FirmwareRevision, 'PELLE');

        service.setCharacteristic(this.Characteristic.SerialNumber, 'OLGA');


        this.addService(service);
        this.addProgrammableSwitch();
    }

    addProgrammableSwitch() {
        console.log('Adding switch');
        var service = new this.Service.StatelessProgrammableSwitch(this.name, this.uuid);

        //service.addCharacteristic(this.Characteristic.ProgrammableSwitchEvent);
        service.getCharacteristic(this.Characteristic.ProgrammableSwitchEvent).setValue(0);

        service.getCharacteristic(this.Characteristic.ProgrammableSwitchEvent).on('set', (value, callback) => {
            console.log('SET', value);
            callback();
        });

        service.getCharacteristic(this.Characteristic.ProgrammableSwitchEvent).on('get', (callback) => {
            console.log('GET');
            callback(null, 1);
        });

        service.getCharacteristic(this.Characteristic.ProgrammableSwitchEvent).on('change', (a, b, c) => {
            console.log('change', a, b, c);
        });

        this.addService(service);
    }

    addService(service) {
        this.services.push(service);
    }

    identify(callback) {
        this.log('Identify called for accessory \'%s\'.', this.name);
        callback();
    }

    getServices() {
        return this.services;
    }

};


module.exports = class Platform  {

    constructor(log, config, homebridge) {

        if (config.host == undefined)
            throw new Error('Must specify a host in ~/.homebridge/config.json.');
            
        this.config         = config;
        this.log            = log;
        this.homebridge     = homebridge;
        this.tradfri        = new Ikea.TradfriClient(config.host);
        this.items          = {};
        this.timestamp      = new Date();

        Accessory = homebridge.platformAccessory;
        Service = homebridge.hap.Service;
        Characteristic = homebridge.hap.Characteristic;
        UUIDGen = homebridge.hap.uuid;

        // Load .env
        require('dotenv').config({path: Path.join(process.env.HOME, '.homebridge/.env')});

        if (process.env.PUSHOVER_USER && process.env.PUSHOVER_TOKEN) {
            this.log('Using Pushover credentials from .env');

            config.pushover = {
                user: process.env.PUSHOVER_USER,
                token: process.env.PUSHOVER_TOKEN
            };
        }


        this.homebridge.on('didFinishLaunching', () => {
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
            this.tradfri.connect(this.config.identity, this.config.psk).then((connected) => {
                if (connected)
                    resolve();
                else
                    reject(new Error('Could not connect.'));
            })
            .catch((error) => {
                reject(error);
            })
        });
    }


    enableListeners() {

        return new Promise((resolve, reject) => {
            var timestamp = new Date();
            var timeout = undefined;

            this.tradfri.on("device updated", (device) => {
                if (device.type === Ikea.AccessoryTypes.lightbulb) {

                    if (this.items[device.instanceId] == undefined) {
                        this.log('Creating accessory \'%s\'...', device.name);

                        timestamp = new Date();
                        var bulb = undefined;

                        switch(device.lightList[0]._spectrum) {
                            case 'white': {
                                bulb = new WarmWhiteLightbulb(this, device);
                                break;
                            }
                            default: {
                                bulb = new Lightbulb(this, device);
                                break;
                            }
                        }

                        this.items[device.instanceId] = bulb;
                    }

                    this.items[device.instanceId].emit('changed', device);
                }
                else {
                }

            });

            this.tradfri.observeDevices();

            timeout = setInterval(() => {
                var now = new Date();
                this.log('Checking...');
                if (now - timestamp > 2000) {
                    this.log('Done!');
                    clearInterval(timeout);
                    resolve();
                }
            }, 500);

        });

    }



    accessories(callback) {

        this.connect().then(() => {
            return this.enableListeners();
        })
        .then(() => {
            var accessories = [];


            for (var id in this.items) {
                accessories.push(this.items[id]);
            }

            accessories.push(new Switch(this, 'ID', 'MEG'));

            this.log('Got %d accessories', accessories.length)
            callback(accessories);
        })
        .catch((error) => {
            this.log(error);
            callback([]);

        })


    }


}
