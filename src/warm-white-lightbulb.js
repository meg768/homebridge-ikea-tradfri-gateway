"use strict";
var sprintf     = require('yow/sprintf');
var isString    = require('yow/is').isString;
var isNumber    = require('yow/is').isNumber;
var Timer       = require('yow/timer');
var Lightbulb   = require('./lightbulb.js');

const COLOR_MIN = 140;
const COLOR_MAX = 500;

module.exports = class WarmWhiteLightbulb extends Lightbulb {

    constructor(platform, device) {
        super(platform, device);

        this.colorTemperature = (COLOR_MAX + COLOR_MIN) / 2;

        this.enableColorTemperature();
    }

    deviceChanged() {
        super.deviceChanged();
        this.updateColorTemperature();
    }

    enableColorTemperature() {
        var colorTemperature = this.lightbulb.getCharacteristic(this.Characteristic.ColorTemperature);

        colorTemperature.on('get', (callback) => {
            callback(null, this.colorTemperature);
        });

        colorTemperature.on('set', (value, callback) => {
            this.setColorTemperature(value, callback);
        });

        this.updateColorTemperature();
    }

    updateColorTemperature() {
        var light = this.device.lightList[0];
        var colorTemperature = this.lightbulb.getCharacteristic(this.Characteristic.ColorTemperature);

        this.colorTemperature = COLOR_MIN + ((COLOR_MAX - COLOR_MIN) * (light.colorTemperature / 100));

        this.log('Updating color temperature to %s on lightbulb \'%s\'', this.colorTemperature, this.name);
        colorTemperature.updateValue(this.colorTemperature);
    }

    setColorTemperature(value, callback) {

        // Make sure it is between MIN and MAX
        value = Math.max(Math.min(value, COLOR_MAX), COLOR_MIN);

        // Set value
        this.colorTemperature = value;

        // Compute color temperature in percent (0-100)
        var percent = parseInt(100 * (this.colorTemperature - COLOR_MIN) / (COLOR_MAX - COLOR_MIN));

        this.log('Setting color temperature to %s%% on lightbulb \'%s\'', percent, this.name);

        this.platform.gateway.operateLight(this.device, {
            colorTemperature: percent
        })
        .then(() => {
            if (callback)
                callback();
        })
    }


};
