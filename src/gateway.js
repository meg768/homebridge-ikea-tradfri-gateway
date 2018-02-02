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

    constructor(options) {

        this.options = Object.assign({}, options);

        if (this.options.host == undefined)
            throw new Error('A host must be specified.');

        if (process.env.IKEA_TRADFRI_PSK)
            this.options.psk = process.env.IKEA_TRADFRI_PSK;

        if (process.env.IKEA_TRADFRI_IDENTITY)
            this.options.identity = process.env.IKEA_TRADFRI_IDENTITY;

        if (this.options.psk == undefined)
            throw new Error('A pre-shared key (psk) must be specified.');

        if (this.options.identity == undefined)
            this.options.identity = 'Client_identity';

        this.log            = isFunction(this.options.log) ? this.options.log : console.log;
        this.gateway        = new Ikea.TradfriClient(this.options.host);

        this.gateway.on('device updated', (device) => {
            this.log('Device %s (%s) updated.', device.name, device.instanceId);
            this.deviceUpdated(device);
        });

        this.gateway.on('group updated', (group) => {
            this.groupUpdated(group);
        });

        this.log(this.options);

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
            this.gateway.connect(this.options.identity, this.options.psk).then((connected) => {
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
