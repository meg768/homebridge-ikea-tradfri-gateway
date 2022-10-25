"use strict";
var Device   = require('./device.js');

module.exports = class AirPurifier extends Device {

    constructor(platform, device) {
        super(platform, device);

        this.log('Creating new air purifier %s (%s)...', this.name, this.id);
        this.airPurifier = new this.Service.AirPurifier(this.name, this.uuid);

        this.addService('airPurifier', this.airPurifier);

        this.enablePower();
        this.enableStatus();
    }

    deviceChanged(device) {
        super.deviceChanged();

        this.updatePower();
        this.updateStatus();
    }

    enablePower() {
        var power = this.airPurifier.getCharacteristic(this.Characteristic.On);

        power.on('get', (callback) => {
            callback(null, this.power);
        });

        power.on('set', (value, callback) => {
            this.setPower(value, callback);
        });

        this.updatePower();

    }

    enableStatus() {
        var alive = this.airPurifier.addCharacteristic(this.Characteristic.StatusActive);

        alive.on('get', (callback) => {
            this.log('Purifier %s in currently %s.', this.name, this.device.alive ? 'ALIVE' : 'DEAD');
            callback(null, this.device.alive);
        });

        this.updateStatus();


    }

    setPower(value, callback) {
        this.log('Setting power to %s on air purifier \'%s\'', value ? 'ON' : 'OFF', this.name);
        this.power = value;

        this.platform.gateway.operateAirPurifier(this.device, {
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
        var purifier = this.device.airPurifierList[0];
        var power = this.airPurifier.getCharacteristic(this.Characteristic.On);

        this.power = purifier.onOff;

        this.log('Updating power to %s on air purifier \'%s\'', this.power ? 'ON' : 'OFF', this.name);
        power.updateValue(this.power);
    }


    updateStatus() {
        var alive = this.airPurifier.getCharacteristic(this.Characteristic.StatusActive);

        this.log('Updating active status to %s on air purifier \'%s\'', this.device.alive ? 'ALIVE' : 'DEAD', this.name);
        alive.updateValue(this.device.alive);
    }

};