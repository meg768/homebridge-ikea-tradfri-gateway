"use strict";

var Events  = require('events');

module.exports = class Accessory extends Events {

    constructor(platform, device) {

        super();

        this.device = device;
        this.uuid = platform.homebridge.hap.uuid.generate(Number(device.instanceId).toString());
        this.name = device.name;
        this.log = platform.log;
        this.platform = platform;
        this.homebridge = platform.homebridge;
        this.Characteristic = platform.homebridge.hap.Characteristic;
        this.Service = platform.homebridge.hap.Service;
        this.services = [];

        var service = new this.Service.AccessoryInformation();

        if (device.deviceInfo.manufacturer)
            service.setCharacteristic(this.Characteristic.Manufacturer, device.deviceInfo.manufacturer);

        if (device.deviceInfo.modelNumber)
            service.setCharacteristic(this.Characteristic.Model, device.deviceInfo.modelNumber);

        if (device.deviceInfo.firmwareVersion)
            service.setCharacteristic(this.Characteristic.FirmwareRevision, device.deviceInfo.firmwareVersion);

        if (device.deviceInfo.serialNumber)
            service.setCharacteristic(this.Characteristic.SerialNumber, device.instanceId);

        this.on('changed', (device) => {
            this.device = device;
            this.deviceChanged();

        });

        this.addService(service);

    }

    deviceChanged() {

    }

    addService(service) {
        this.services.push(service);
    }

    identify(callback) {
        this.log('Identify called for accessory \'%s\'.', this.name);
        callback();
    }

    getServices() {
        return this.services;
    }

};
