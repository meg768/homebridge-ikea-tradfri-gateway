"use strict";

var Events           = require('events');
var Path             = require('path');
var isObject         = require('yow/is').isObject;
var isString         = require('yow/is').isString;
var isFunction       = require('yow/is').isFunction;
var sprintf          = require('yow/sprintf');
var isString         = require('yow/is').isString;
var Timer            = require('yow/timer');
var Ikea             = require('node-tradfri-client');



module.exports = class Gateway  {

    constructor(log, config) {

        if (config.host == undefined)
            throw new Error('Must specify a host in ~/.homebridge/config.json.');

        if (process.env.IKEA_TRADFRI_PSK)
            config.psk = process.env.IKEA_TRADFRI_PSK;

        if (process.env.IKEA_TRADFRI_IDENTITY)
            config.identity = process.env.IKEA_TRADFRI_IDENTITY;

        if (config.psk == undefined)
            throw new Error('A pre-shared key (psk) must be specified in ~/.homebridge/config.json.')

        if (config.identity == undefined)
            config.identity = 'Client_identity';

        this.config         = config;
        this.log            = log;
        this.gateway        = new Ikea.TradfriClient(config.host);

        this.gateway.on('device updated', (device) => {
            this.deviceUpdated(device);
        });

        this.gateway.on('group updated', (group) => {
            this.groupUpdated(group);
        });


    }

    enablePing() {

        setInterval(() => {
            this.gateway.ping().then(() => {
                this.log('Ping OK.');
            })
            .catch((error) => {
                this.log('Ping failed!');
                this.log(error);
            })
        }, 10000);

        return Promise.resolve();

    }

    connect() {
        return new Promise((resolve, reject) => {
            this.log('Connecting...');
            this.gateway.connect(this.config.identity, this.config.psk).then((connected) => {
                if (connected)
                    return Promise.resolve();
                else
                    reject(new Error('Could not connect.'));
            })
            .then(() => {
                this.log('Loading devices...');
                return this.gateway.observeDevices();
            })
            .then(() => {
                this.log('Loading groups and scenes...');
                return this.gateway.observeGroupsAndScenes();

            })
            .then(() => {
                return this.enablePing();
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



    deviceUpdated(device) {
    }

    groupUpdated(group) {
    }
}
