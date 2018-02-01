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

        this.enableHue();
        this.enableSaturation();
    }



    deviceChanged() {
        super.deviceChanged();
        this.updateHue();
        this.updateSaturation();
    }

    updateHue() {
        var light = this.device.lightList[0];
        var hue = this.lightbulb.getCharacteristic(this.Characteristic.Hue);
        var color = ColorConvert.hex.hsl(light.color);

        hue.updateValue(this.hue = color[0]);
        this.log('Updating to color %s (%s, %s, %s) on lightbulb \'%s\'', light.color, this.hue, this.saturation, this.luminance, this.name);
    }

    updateSaturation() {
        var light = this.device.lightList[0];
        var saturation = this.lightbulb.getCharacteristic(this.Characteristic.Saturation);
        var color = ColorConvert.hex.hsl(light.color);

        saturation.updateValue(this.saturation = this.saturation = color[1]);
        this.log('Updating to color %s (%s, %s, %s) on lightbulb \'%s\'', light.color, this.hue, this.saturation, this.luminance, this.name);
    }

    enableHue() {
        var hue = this.lightbulb.getCharacteristic(this.Characteristic.Hue);

        this.updateHue();

        hue.on('get', (callback) => {
            callback(null, this.hue);
        });

        hue.on('set', (value, callback) => {
            // Set value
            this.hue = value;
            this.log('Setting hue to %s on lightbulb \'%s\'', this.hue, this.name);

            this.platform.gateway.operateLight(this.device, {
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
        var saturation = this.lightbulb.getCharacteristic(this.Characteristic.Saturation);

        this.updateSaturation();

        saturation.on('get', (callback) => {
            callback(null, this.saturation);
        });

        saturation.on('set', (value, callback) => {
            // Set value
            this.saturation = value;
            this.log('Setting saturation to %s on lightbulb \'%s\'', this.saturation, this.name);

            this.platform.gateway.operateLight(this.device, {
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
