"use strict";
var Device   = require('./device.js');

module.exports = class Blind extends Device {

    constructor(platform, device) {
        super(platform, device);

        this.blind = new this.Service.WindowCovering(this.name, this.uuid);
        this.services.battery = new this.Service.BatteryService(`${this.name} Battery`);
        this.lowBatteryLimit = platform.config.lowBatteryLimit || 10;
        this.addService('blind', this.blind);
        this.enablePosition();
        this.enableTargetPosition();
        this.enableBattery();
        this.previousPosition = this.position;
    }

    deviceChanged(device) {
        super.deviceChanged();
        this.updatePosition();
        this.updateBatteryLevel();
        this.estimateTargetPositionIfNeeded();
        this.previousPosition = this.position;
    }

    enablePosition() {
        var position = this.blind.getCharacteristic(this.Characteristic.CurrentPosition)
        position.on('get', (callback) => {
            callback(null, this.position);
        });
        this.updatePosition();
    }

    enableTargetPosition() {
        var targetPosition = this.blind.getCharacteristic(this.Characteristic.TargetPosition);
        targetPosition.on('get', (callback) => {
            callback(null, this.targetPosition);
        });
        targetPosition.on('set', (value, callback) => {
            this.setTargetPosition(value, callback);
        });
        this.updateTargetPosition(this.position);
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

    setTargetPosition(value, callback) {
        this.log('Setting target position to %s on blind \'%s\'', value, this.name);
        this.position = value;
        this.targetPosition = value;
        this.platform.gateway.operateBlind(this.device, {
            position: value
        })
        .then(() => {
            if (callback)
                callback();
        });
    }

    estimateTargetPositionIfNeeded() {
        let position = this.position;
        let increasing = this.previousPosition < position && this.targetPosition < position;
        let decreasing = this.previousPosition > position && this.targetPosition > position;
        if (increasing) {
            this.updateTargetPosition(100);
        } else if (decreasing) {
            this.updateTargetPosition(0);
        }

        setTimeout(() => {
            // If no new position we can assume that blinds has been stopped
            if (this.position === position) {
                this.updateTargetPosition(this.position);
            }
        }, 2000);
    }

    updatePosition() {
        var blind = this.device.blindList[0];
        var position = this.blind.getCharacteristic(this.Characteristic.CurrentPosition);
        this.position = blind.position;
        this.log('Updating position to %s on blind \'%s\'', this.position, this.name);
        position.updateValue(this.position);
    }

    updateTargetPosition(position) {
        var targetPosition = this.blind.getCharacteristic(this.Characteristic.TargetPosition);
        this.targetPosition = position;
        this.log('Updating target position to %s on blind \'%s\'', this.targetPosition, this.name);
        targetPosition.updateValue(this.targetPosition);
    }

    updateBatteryLevel() {
        var lowBatteryStatus = this.blind.getCharacteristic(this.Characteristic.StatusLowBattery);
        this.batteryLevel = this.device.deviceInfo.battery
        this.log('Updating battery level to %s on blind \'%s\'', this.batteryLevel, this.name);
        lowBatteryStatus.updateValue(this.batteryLevel <= this.lowBatteryLimit);
    }
};
