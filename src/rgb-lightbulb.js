"use strict";
var sprintf      = require('yow/sprintf');
var isString     = require('yow/is').isString;
var isNumber     = require('yow/is').isNumber;
var Timer        = require('yow/timer');
var Lightbulb    = require('./lightbulb.js');
var ColorConvert = require('color-convert');

module.exports = class RgbLightbulb extends Lightbulb {

    constructor(platform, device) {
        super(platform, device);

        this.hue = 0;
        this.saturation = 0;
        this.luminance = 50;

    }

    addCharacteristics() {
        super.addCharacteristics();
        this.enableHue();
        this.enableSaturation();
    }

    deviceChanged() {
        super.deviceChanged();

        var light = this.device.lightList[0];
        var color = ColorConvert.hex.hsl(light.color);

        this.hue        = color[0];
        this.saturation = color[1];
        this.luminance  = 50;

        this.log('Updating to color hsl(%s, %s, %s) on lightbulb \'%s\'', this.hue, this.saturation, this.luminance, this.name);
        this.lightbulb.getCharacteristic(this.Characteristic.Hue).updateValue(this.hue);
        this.lightbulb.getCharacteristic(this.Characteristic.Saturation).updateValue(this.saturation);

    }

    enableHue() {
        var characteristic = this.lightbulb.getCharacteristic(this.Characteristic.Hue);

        characteristic.on('get', (callback) => {
            callback(null, this.hue);
        });

        characteristic.on('set', (value, callback) => {
            // Set value
            this.hue = value;
            this.log('Setting hue to %s on lightbulb \'%s\'', this.hue, this.name);

            this.platform.tradfri.operateLight(this.device, {
                color: ColorConvert.hsl.hex(this.hue, this.saturation, this.luminance),
                transitionTime: 0.1
            })
            .then(() => {
                if (callback)
                    callback();
            })
        });
    }


    enableSaturation() {
        var characteristic = this.lightbulb.getCharacteristic(this.Characteristic.Saturation);

        characteristic.on('get', (callback) => {
            callback(null, this.saturation);
        });

        characteristic.on('set', (value, callback) => {
            // Set value
            this.saturation = value;
            this.log('Setting saturation to %s on lightbulb \'%s\'', this.saturation, this.name);

            this.platform.tradfri.operateLight(this.device, {
                color: ColorConvert.hsl.hex(this.hue, this.saturation, this.luminance),
                transitionTime: 0.1
            })
            .then(() => {
                if (callback)
                    callback();
            })
        });
    }



};
