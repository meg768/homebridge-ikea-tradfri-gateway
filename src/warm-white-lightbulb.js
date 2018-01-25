"use strict";
var sprintf     = require('yow/sprintf');
var isString    = require('yow/is').isString;
var isNumber    = require('yow/is').isNumber;
var Timer       = require('yow/timer');
var Lightbulb   = require('./lightbulb.js');
var Accessory  = require('./accessory.js');

const COLOR_MIN = 140;
const COLOR_MAX = 500;

module.exports = class WarmWhiteLightbulb extends Lightbulb {

    constructor(platform, device) {
        super(platform, device);

    }

    addCharacteristics() {
        super.addCharacteristics();
        this.enableColorTemperature();
    }

    deviceChanged(device) {
        super.deviceChanged();

        this.updateColorTemperature();
    }


    enableColorTemperature() {
        var colorTemperature = this.lightbulb.getCharacteristic(this.Characteristic.ColorTemperature);

        // Set mid-tempertature
        this.colorTemperature = (COLOR_MAX + COLOR_MIN) / 2;

        colorTemperature.on('get', (callback) => {
            callback(null, this.colorTemperature);
        });

        colorTemperature.on('set', (value, callback) => {
            this.setColorTemperature(value, callback);
        });
    }

    updateColorTemperature() {
        var light = this.device.lightList[0];
        var colorTemperature = this.lightbulb.getCharacteristic(this.Characteristic.ColorTemperature);

        this.colorTemperature = light.colorTemperature / 100;

        this.log('Updating color temperature to %s on lightbulb \'%s\'', this.colorTemperature, this.name);
        colorTemperature.updateValue(this.colorTemperature);
    }

    setColorTemperature(value, callback) {
        this.log('Setting color temperature to %s on lightbulb \'%s\'', value, this.name);

        this.colorTemperature = Math.max(Math.min(value, COLOR_MAX), COLOR_MIN);

        var percent = 100 * (this.colorTemperature - COLOR_MIN) / (COLOR_MAX - COLOR_MIN);

        this.log('Adjusted value is %s', percent);

        this.platform.tradfri.operateLight(this.device, {
            colorTemperature: percent
        })
        .then(() => {
            if (callback)
                callback();
        })
    }


};
