"use strict";
var Device   = require('./device.js');

module.exports = class Blind extends Device {

    constructor(platform, device) {
        super(platform, device);

        this.blind = new this.Service.WindowCovering(this.name, this.uuid);

        this.addService('blind', this.blind);

        this.enablePosition();
        this.enableTargetPosition();
    }

    deviceChanged(device) {
        super.deviceChanged();
        this.updatePosition();
    }

    enablePosition() {
        var position = this.blind.getCharacteristic(this.Characteristic.CurrentPosition)
        position.on('get', (callback) => {
            callback(null, this.position)
        });
        this.updatePosition()
    }

    enableTargetPosition() {
        var targetPosition = this.blind.getCharacteristic(this.Characteristic.TargetPosition)
        targetPosition.on('get', (callback) => {
            callback(null, this.targetPosition)
        });
        targetPosition.on('set', (value, callback) => {
            this.setTargetPosition(value, callback);
        });
        this.updateTargetPosition()
    }

    setTargetPosition(value, callback) {
        this.log('Setting target position to %s on blind \'%s\'', value, this.name);
        this.position = value
        this.targetPosition = value
        this.platform.gateway.operateBlind(this.device, {
            position: 100 - value
        })
        .then(() => {
            if (callback)
                callback();
        });
    }

    updatePosition() {
        var blind = this.device.blindList[0]
        var position = this.blind.getCharacteristic(this.Characteristic.CurrentPosition)
        this.position = 100 - blind.position;
        this.log('Updating position to %s on blind \'%s\'', this.position, this.name);
        position.updateValue(this.position);
    }

    updateTargetPosition() {
        var targetPosition = this.blind.getCharacteristic(this.Characteristic.TargetPosition)
        this.targetPosition = this.position
        this.log('Updating taget position to %s on blind \'%s\'', this.targetPosition, this.name);
        targetPosition.updateValue(this.targetPosition);
    }
};