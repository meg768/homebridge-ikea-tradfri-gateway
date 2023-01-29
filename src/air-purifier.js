"use strict";
var Device   = require('./device.js');

module.exports = class AirPurifier extends Device {

    constructor(platform, device) {
        super(platform, device);

        this.log('Creating new air purifier %s (%s)...', this.name, this.id);
        this.airPurifier = new this.Service.AirPurifier(this.name, this.uuid);
        this.airQualitySensor = new this.Service.AirQualitySensor(this.name, this.uuid);

        this.addService('airPurifier', this.airPurifier);
        this.addService('airQualitySensor', this.airQualitySensor);

        this.enablePower();
        this.enableSpeed();
        this.enableAirQuality();
        this.enableControlLock();
        this.enableState();
        this.enableStatus();
    }

    deviceChanged(device) {
        super.deviceChanged();

        this.updatePower();
        this.updateSpeed();
        this.updateAirQuality();
        this.updateControlLock();
        this.updateState();
        this.updateStatus();
    }

    enablePower() {
        var active = this.airPurifier.getCharacteristic(this.Characteristic.Active);
        active.on('get', (callback) => {
            callback(null, this.active);
        });
        active.on('set', (value, callback) => {
            this.setPower(value, callback);
        });
        this.updatePower();
    }

    enableSpeed() {
        var autoSpeed = this.airPurifier.getCharacteristic(this.Characteristic.TargetAirPurifierState);
        var percentSpeed = this.airPurifier.getCharacteristic(this.Characteristic.RotationSpeed);
        autoSpeed.on('get', (callback) => {
            callback(null, this.autoSpeed);
        });
        autoSpeed.on('set', (value, callback) => {
            this.setSpeed(value, this.percentSpeed, callback);
        });
        percentSpeed.on('get', (callback) => {
            callback(null, this.percentSpeed);
        });
        percentSpeed.on('set', (value, callback) => {
            this.setSpeed(this.autoSpeed, value, callback);
        });
        this.updateSpeed();
    }

    enableState() {
        var currentAirPurifierState = this.airPurifier.getCharacteristic(this.Characteristic.CurrentAirPurifierState);
        currentAirPurifierState.on('get', (callback) => {
            callback(null, this.currentAirPurifierState);
        });
        this.updateState();
    }

    enableAirQuality() {
        var airQuality = this.airQualitySensor.getCharacteristic(this.Characteristic.AirQuality);
        var pm2_5Density = this.airQualitySensor.getCharacteristic(this.Characteristic.PM2_5Density);
        airQuality.on('get', (callback) => {
            callback(null, this.airQuality);
        });
        pm2_5Density.on('get', (callback) => {
            callback(null, this.pm2_5Density);
        });
        this.updateAirQuality();
    }

    enableControlLock() {
        var lockPhysicalControls = this.airPurifier.getCharacteristic(this.Characteristic.LockPhysicalControls);
        lockPhysicalControls.on('get', (callback) => {
            callback(null, this.lockPhysicalControls);
        });
        lockPhysicalControls.on('set', (value, callback) => {
            this.setControlLock(value, callback);
        });
        this.updateControlLock();
    }

    enableStatus() {
        var alive = this.airPurifier.addCharacteristic(this.Characteristic.StatusActive);
        var aliveSensor = this.airQualitySensor.addCharacteristic(this.Characteristic.StatusActive);

        alive.on('get', (callback) => {
            this.log('Purifier %s in currently %s.', this.name, this.device.alive ? 'ALIVE' : 'DEAD');
            callback(null, this.device.alive);
        });
        aliveSensor.on('get', (callback) => {
            this.log.debug('Sensors %s in currently %s.', this.name, this.active ? 'ALIVE' : 'DEAD');
            callback(null, this.active);
        });
        this.updateStatus();
    }

    setPower(value, callback) {
        this.log('Setting active to %s on air purifier \'%s\'.', value ? 'ACTIVE' : 'INACTIVE', this.name);
        if (this.active == value) {
            if (callback)
                callback();
        } else {
            this.active = value;
            this.platform.gateway.operateAirPurifier(this.device, {
                fanMode: this.active
            })
            .then(() => {
                if (callback)
                    callback();
            })
            .catch((error) => {
                this.log.debug(error);
            });
        };
    }

    setSpeed(autoSpeed, percentSpeed, callback) {
        this.log('Setting control mode to %s on air purifier \'%s\'.', autoSpeed ? 'AUTO' : 'MANUAL', this.name);
        this.log('Setting speed to %s%% on air purifier \'%s\'.', percentSpeed, this.name);
        this.fanSpeed = percentSpeed/2 | 0;
        if (autoSpeed == 0) {
            this.fanMode = this.fanSpeed;
        } else {
            this.fanMode = 1;
            this.autoSpeed = 1;
        };
        this.log.debug('SET - FANMODE', this.fanMode, 'FANSPEED (0-50)', this.fanSpeed);
        this.platform.gateway.operateAirPurifier(this.device, {
            fanMode: this.fanMode,
            fanSpeed: this.fanSpeed
        }).then(() => {
            if (callback)
                callback();
        })
        .catch((error) => {
            this.log(error);
        });
    }

    setControlLock(value, callback) {
        this.log('Setting child lock to %s on air purifier \'%s\'.', value ? 'LOCK' : 'UNLOCK', this.name);
        this.lockPhysicalControls = value;

        this.platform.gateway.operateAirPurifier(this.device, {
            controlsLocked: this.lockPhysicalControls
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
        var active = this.airPurifier.getCharacteristic(this.Characteristic.Active);
        if (active.value != this.active) {
            this.log('Updating active to \'%s\' on air purifier \'%s\'.', this.active ? 'ACTIVE' : 'INACTIVE', this.name);
        } else {
            this.log.debug('Updating active to \'%s\' on air purifier \'%s\'.', this.active ? 'ACTIVE' : 'INACTIVE', this.name);
        }
        this.active = (purifier.fanMode != 0);
        active.updateValue(this.active);
    }

    updateSpeed() {
        var purifier = this.device.airPurifierList[0];
        var autoSpeed = this.airPurifier.getCharacteristic(this.Characteristic.TargetAirPurifierState);
        var percentSpeed = this.airPurifier.getCharacteristic(this.Characteristic.RotationSpeed);
        if (this.percentSpeed != purifier.fanSpeed*2) {
            this.log('Updating speed to %s%% on air purifier \'%s\'.', this.percentSpeed, this.name);
        } else {
            this.log.debug('Updating speed to %s%% on air purifier \'%s\'.', this.percentSpeed, this.name);
        }

        this.percentSpeed = purifier.fanSpeed*2;
        percentSpeed.updateValue(this.percentSpeed);

        if (this.autoSpeed != autoSpeed.value) {
            this.log('Updating control mode to \'%s\' on air purifier \'%s\'.', this.autoSpeed ? 'AUTO' : 'MANUAL', this.name);
        } else {
            this.log.debug('Updating control mode to \'%s\' on air purifier \'%s\'.', this.autoSpeed ? 'AUTO' : 'MANUAL', this.name);
        }
        if (purifier.fanMode == 1 || purifier.fanMode == 0) {
            this.autoSpeed = 1;
        } else {
            this.autoSpeed = 0;
        };
        autoSpeed.updateValue(this.autoSpeed);
    }

    updateState() {
        var purifier = this.device.airPurifierList[0];
        var currentAirPurifierState = this.airPurifier.getCharacteristic(this.Characteristic.CurrentAirPurifierState);
        if (currentAirPurifierState.value != this.currentAirPurifierState) {
            this.log('Updating state to %s on air purifier \'%s\'.', this.currentAirPurifierState/2 ? 'PURIFYING_AIR' : 'INACTIVE', this.name);
        } else {
            this.log.debug('Updating state to %s on air purifier \'%s\'.', this.currentAirPurifierState/2 ? 'PURIFYING_AIR' : 'INACTIVE', this.name);
        }

        if (purifier.fanMode == 0 || purifier.fanSpeed == 0) {
            this.currentAirPurifierState = 0;
        } else if (purifier.fanSpeed > 0) {
            this.currentAirPurifierState = 2;
        } else {
            this.currentAirPurifierState = 0;
        }
        currentAirPurifierState.updateValue(this.currentAirPurifierState);
    }

    updateAirQuality() {
        var purifier = this.device.airPurifierList[0];
        var airQuality = this.airQualitySensor.getCharacteristic(this.Characteristic.AirQuality);
        var pm2_5Density = this.airQualitySensor.getCharacteristic(this.Characteristic.PM2_5Density);
        if (this.pm2_5Density != purifier.airQuality) {
            this.log('Updating air quality to PM2.5 \= %sppm \(%s\) on air purifier \'%s\'.', this.pm2_5Density, this.airQualityDesc, this.name);
        } else {
            this.log.debug('Updating air quality to PM2.5 \= %sppm \(%s\) on air purifier \'%s\'.', this.pm2_5Density, this.airQualityDesc, this.name);
        }

        this.pm2_5Density = purifier.airQuality;
        var airQualityDesc = 'UNKNOWN';
        if (purifier.airQuality > 0 && purifier.airQuality <= 15) {
            this.airQuality = 1;
            this.airQualityDesc = 'EXCELLENT';
        } else if (purifier.airQuality <= 35) {
            this.airQuality = 2;
            this.airQualityDesc = 'GOOD';
        } else if (purifier.airQuality <= 55) {
            this.airQuality = 3;
            this.airQualityDesc = 'FAIR';
        } else if (purifier.airQuality <= 85) {
            this.airQuality = 4;
            this.airQualityDesc = 'INFERIOR';
        } else if (purifier.airQuality <= 1000) {
            this.airQuality = 5;
            this.airQualityDesc = 'POOR';
        } else {
            this.airQuality = 0;
            this.pm2_5Density = 0;
        };
        airQuality.updateValue(this.airQuality);
        pm2_5Density.updateValue(this.pm2_5Density);
        // this.updateAirQualitySensor();
    }

    // updateAirQualitySensor() {
    //     var airQuality = this.airQualitySensor.getCharacteristic(this.Characteristic.AirQuality);
    //     var pm2_5Density = this.airQualitySensor.getCharacteristic(this.Characteristic.PM2_5Density);
    //     airQuality.updateValue(this.airQuality);
    //     pm2_5Density.updateValue(this.pm2_5Density);
    // }

    updateControlLock() {
        var purifier = this.device.airPurifierList[0];
        var lockPhysicalControls = this.airPurifier.getCharacteristic(this.Characteristic.LockPhysicalControls);
        if (this.lockPhysicalControls != purifier.controlsLocked) {
            this.log('Updating child lock to %s on air purifier \'%s\'.', this.lockPhysicalControls ? 'LOCK' : 'UNLOCK', this.name);
        } else {
            this.log.debug('Updating child lock to %s on air purifier \'%s\'.', this.lockPhysicalControls ? 'LOCK' : 'UNLOCK', this.name);
        }

        this.lockPhysicalControls = purifier.controlsLocked;
        lockPhysicalControls.updateValue(this.lockPhysicalControls);
    }
        
    updateStatus() {
        var alive = this.airPurifier.getCharacteristic(this.Characteristic.StatusActive);
        var aliveSensor = this.airQualitySensor.getCharacteristic(this.Characteristic.StatusActive);
        if (alive.value != this.device.alive) {
            this.log('Updating active status to %s on air purifier \'%s\'.', this.device.alive ? 'ALIVE' : 'DEAD', this.name);
        } else {
            this.log.debug('Updating active status to %s on air purifier \'%s\'.', this.device.alive ? 'ALIVE' : 'DEAD', this.name);
        }

        alive.updateValue(this.device.alive);
        aliveSensor.updateValue(this.active);
    }

};