"use strict";

var Accessory  = require('./accessory.js');


module.exports = class Device extends Accessory {

    constructor(platform, device) {

        super(platform, device.name, device.instanceId);

        this.device = device;

        this.on('changed', (device) => {
            this.device = device;
            this.deviceChanged();
        });

        this.addAccessoryInformation();
    }

    deviceChanged() {
    }

    getManufacturer() {
        return this.device.deviceInfo.manufacturer;
    }

    getModel() {
        return this.device.deviceInfo.modelNumber;
    }

    getFirmwareVersion() {
        return this.device.deviceInfo.firmwareVersion;
    }

};
