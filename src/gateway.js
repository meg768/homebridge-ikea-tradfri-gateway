var Ikea = require('node-tradfri-client');

module.exports = class Gateway  {

    constructor(log, config) {

        config = Object.assign({}, config);

        if (config.psk && !config.securityCode)
            config.securityCode = config.psk;

        if (process.env.IKEA_TRADFRI_SECURITY_CODE)
            config.securityCode = process.env.IKEA_TRADFRI_SECURITY_CODE;

        if (process.env.IKEA_TRADFRI_HOST)
            config.host = process.env.IKEA_TRADFRI_HOST;

        if (config.securityCode == undefined)
            throw new Error('The security code from the back of the IKEA gateway must be specified in ~/.homebridge/config.json.')

        this.config         = config;
        this.log            = log;
        this.gateway        = null;
    }

    getHostName() {
        return new Promise((resolve, reject) => {

            if (this.config.host != undefined)
                resolve(this.config.host);
            else {
                this.log('Discovering gateway...');

                Ikea.discoverGateway().then((discovery) => {
                    this.log('Discovered host "%s"', discovery.name);
                    resolve(discovery.name);
                })
                .catch((error) => {
                    reject(error);
                })
            }
        });        
    }

    enablePing() {

        setInterval(() => {
            this.gateway.ping().then(() => {
                this.log('Ping OK.');
            })
            .catch((error) => {
                this.log('Ping failed!');
                this.log(error);
            })
        }, 60000);

        return Promise.resolve();

    }

    connect() {
        return new Promise((resolve, reject) => {
            Promise.resolve().then(() => {
                return this.getHostName();
            })

            .then((host) => {
                this.gateway = new Ikea.TradfriClient(host);

                this.gateway.on('device updated', (device) => {
                    this.deviceUpdated(device);
                });
        
                this.gateway.on('group updated', (group) => {
                    this.groupUpdated(group);
                });
                return Promise.resolve();
            })

            .then(() => {
                return this.gateway.authenticate(this.config.securityCode);
            })
            .then((credentials) => {
                return this.gateway.connect(credentials.identity, credentials.psk);
            })
            .then((connected) => {
                if (connected)
                    return Promise.resolve();
                else
                    reject(new Error('Could not connect.'));
            })
            .then(() => {
                this.log('Loading devices...');
                return this.gateway.observeDevices();
            })
            .then(() => {
                this.log('Loading groups and scenes...');
                return this.gateway.observeGroupsAndScenes();

            })
            .then(() => {
                return this.enablePing();
            })
            .then(() => {
                this.log('Done.');
                resolve();
            })
            .catch((error) => {
                reject(error);
            })
        });
    }

    deviceUpdated(device) {
    }

    groupUpdated(group) {
    }
}
