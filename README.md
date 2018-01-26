# homebridge-ikea-tradfri-gateway

A HomeBridge plugin for the IKEA Trådfri Gateway.

NOTE: This does not work with the latest firmware update.

## Installation

First, install Homebridge. See https://www.npmjs.com/package/homebridge for more information.
Then install this plugin.

    $ sudo npm install homebridge-ikea-tradfri-gateway -g

## Configuration File

Configure your **~/.homebridge/config.json** with the following platform.


```javascript
{
    "bridge": {
        "name": "Trådfri",
        "username": "AA:22:3D:E3:CE:57",
        "port": 51826,
        "pin": "031-45-123"
    },

    "description": "This is an example configuration file",

    "platforms": [
        {
            "platform": "Ikea Trådfri Gateway",
            "name": "Ikea Trådfri Gateway",
            "host": "192.168.xxx.xxx",
            "psk" : "xxxxxxx"
        }
    ]


}

```

After this, start **homebridge**, scan the presented code with your iPhone, and hopefully
you will se this plugin in your iPhone Home app.
