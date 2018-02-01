"use strict";
var sprintf  = require('yow/sprintf');
var isString = require('yow/is').isString;
var isNumber = require('yow/is').isNumber;
var Device   = require('./device.js');

module.exports = class Lightbulb extends Device {

    constructor(platform, device) {
        super(platform, device);

        this.log('Creating new lightbulb %s (%s)...', this.name, this.id);
        this.lightbulb = new this.Service.Lightbulb(this.name, this.uuid);

        this.addService('lightbulb', this.lightbulb);

        this.enablePower();
        this.enableBrightness();
        this.enableStatus();
    }

    deviceChanged(device) {
        super.deviceChanged();

        this.updatePower();
        this.updateBrightness();
        this.updateStatus();
    }

    enablePower() {
        var power = this.lightbulb.getCharacteristic(this.Characteristic.On);

        power.on('get', (callback) => {
            callback(null, this.power);
        });

        power.on('set', (value, callback) => {
            this.setPower(value, callback);
        });

        this.updatePower();

    }

    enableBrightness() {
        var brightness = this.lightbulb.addCharacteristic(this.Characteristic.Brightness);

        brightness.on('get', (callback) => {
            callback(null, this.brightness);
        });

        brightness.on('set', (value, callback) => {
            this.setBrightness(value, callback);
        });

        this.updateBrightness();
    }

    enableStatus() {
        var alive = this.lightbulb.addCharacteristic(this.Characteristic.StatusActive);

        alive.on('get', (callback) => {
            this.log('Light %s in currently %s.', this.name, this.device.alive ? 'ALIVE' : 'DEAD');
            callback(null, this.device.alive);
        });

        this.updateStatus();


    }

    setPower(value, callback) {
        this.log('Setting power to %s on lightbulb \'%s\'', value ? 'ON' : 'OFF', this.name);
        this.power = value;

        this.platform.gateway.operateLight(this.device, {
            onOff: this.power
        })
        .then(() => {
            if (callback)
                callback();
        })
        .catch((error) => {
            this.log(error);
        });
    }

    setBrightness(value, callback) {
        this.log('Setting brightness to %s on lightbulb \'%s\'', value, this.name);
        this.brightness = value;

        this.platform.gateway.operateLight(this.device, {
            dimmer: this.brightness
        })
        .then(() => {
            if (callback)
                callback();
        });
    }

    updatePower() {
        var light = this.device.lightList[0];
        var power = this.lightbulb.getCharacteristic(this.Characteristic.On);

        this.power = light.onOff;

        this.log('Updating power to %s on lightbulb \'%s\'', this.power ? 'ON' : 'OFF', this.name);
        power.updateValue(this.power);
    }

    updateBrightness() {
        var light = this.device.lightList[0];
        var brightness = this.lightbulb.getCharacteristic(this.Characteristic.Brightness);

        this.brightness = light.dimmer;

        this.log('Updating brightness to %s%% on lightbulb \'%s\'', this.brightness, this.name);
        brightness.updateValue(this.brightness);

    }

    updateStatus() {
        var alive = this.lightbulb.getCharacteristic(this.Characteristic.StatusActive);

        this.log('Updating active status to %s on lightbulb \'%s\'', this.device.alive ? 'ALIVE' : 'DEAD', this.name);
        alive.updateValue(this.device.alive);
    }

};
