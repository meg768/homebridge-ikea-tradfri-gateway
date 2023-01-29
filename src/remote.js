"use strict";
var Device   = require('./device.js');

module.exports = class Remote extends Device {

    constructor(platform, device) {
        super(platform, device);

        this.services.battery = new this.Service.BatteryService(`${this.name} Battery`);
        this.lowBatteryLimit = platform.config.lowBatteryLimit || 10;
        this.enableBattery();
    }

    deviceChanged(device) {
        super.deviceChanged();
        this.updateBatteryLevel();
    }

    enableBattery() {
        var batteryLevel = this.services.battery.getCharacteristic(this.Characteristic.BatteryLevel);
        batteryLevel.on('get', (callback) => {
            callback(null, this.device.deviceInfo.battery);
        });

        var lowBatteryStatus = this.services.battery.getCharacteristic(this.Characteristic.StatusLowBattery);
        lowBatteryStatus.on('get', (callback) => {
            let battery = this.device.deviceInfo.battery
            callback(null, battery <= this.lowBatteryLimit);
        });
    }

    updateBatteryLevel() {
        var lowBatteryStatus = this.blind.getCharacteristic(this.Characteristic.StatusLowBattery);
        this.batteryLevel = this.device.deviceInfo.battery
        this.log('Updating battery level to %s on blind \'%s\'', this.batteryLevel, this.name);
        lowBatteryStatus.updateValue(this.batteryLevel <= this.lowBatteryLimit);
    }
};
