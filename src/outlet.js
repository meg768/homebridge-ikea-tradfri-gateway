"use strict";
var sprintf  = require('yow/sprintf');
var isString = require('yow/is').isString;
var isNumber = require('yow/is').isNumber;
var Device   = require('./device.js');

module.exports = class Outlet extends Device {

    constructor(platform, device) {
        super(platform, device);

        this.outlet = new this.Service.Outlet(this.name, this.uuid);

        this.addService('outlet', this.outlet);

        this.enablePower();
        this.enableStatus();
    }

    deviceChanged(device) {
        super.deviceChanged();

        this.updatePower();
        this.updateStatus();
    }

    enablePower() {
        var power = this.outlet.getCharacteristic(this.Characteristic.On);

        power.on('get', (callback) => {
            callback(null, this.power);
        });

        power.on('set', (value, callback) => {
            this.setPower(value, callback);
        });

        this.updatePower();

    }



    enableStatus() {
        var alive = this.outlet.addCharacteristic(this.Characteristic.StatusActive);

        alive.on('get', (callback) => {
            this.log('Outlet %s in currently %s.', this.name, this.device.alive ? 'ALIVE' : 'DEAD');
            callback(null, this.device.alive);
        });

        this.updateStatus();


    }

    setPower(value, callback) {
        this.log('Setting power to %s on outlet \'%s\'', value ? 'ON' : 'OFF', this.name);
        this.power = value;

        this.platform.gateway.operatePlug(this.device, {
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



    updatePower() {

        var plug  = this.device.plugList[0];
        var power = this.outlet.getCharacteristic(this.Characteristic.On);

        this.power = plug.onOff;

        this.log('Updating power to %s on outlet \'%s\'', this.power ? 'ON' : 'OFF', this.name);
        power.updateValue(this.power);
    }


    updateStatus() {
        var alive = this.outlet.getCharacteristic(this.Characteristic.StatusActive);

        this.log('Updating active status to %s on outlet \'%s\'', this.device.alive ? 'ALIVE' : 'DEAD', this.name);
        alive.updateValue(this.device.alive);
    }

};
