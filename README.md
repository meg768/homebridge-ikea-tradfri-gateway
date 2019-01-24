# homebridge-ikea-tradfri-gateway

Yet another HomeBridge plugin for the IKEA Trådfri Gateway.

There are several other npm modules that connect to the IKEA Trådfri Gateway.

* [homebridge-tradfri-plugin](https://www.npmjs.com/package/homebridge-tradfri-plugin)
* [homebridge-tradfri](https://www.npmjs.com/package/homebridge-tradfri)
* [homebridge-ikea](https://www.npmjs.com/package/homebridge-ikea)

This plugin uses the npm module
[node-tradfri-client](https://www.npmjs.com/package/node-tradfri-client)
from
[alcalzone](https://www.npmjs.com/~alcalzone)
that does not require any other components to be installed and works on multiple
platforms.

## Installation

First, install Homebridge. See https://www.npmjs.com/package/homebridge
for more information.

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
            "securityCode" : "xxxxxxx",
            "expose": ["lightbulbs", "outlets"]
        }
    ]


}

```
## What This Plugin Does

This plugin simply extracts all lightbulbs currently in use by the IKEA Trådfri
Gateway and exposes them to HomeKit and you have the ability to turn the
bulbs on or off. And, of course, you may change the device names and
group them into rooms on your iPhone or iPad.

The following IKEA lighbulbs are supported

- Standard white bulbs
- RGB bulbs
- Warm white bulbs with temperature control
- Outlets

After this, start **homebridge**, scan the presented code with your iPhone, and hopefully
you will se all you IKEA lightbulbs in your iPhone/iPad Home app.


## To Do

* Find out gateway version and act accordingly
* Support motion sensors and remote controls if possible
* Handle reboot or connection break of gateway

## Bugfixes/Updates

* 2018-01-29 -  Can now have accessories with the same name in the IKEA app
* 2018-02-04 -  Updated to work with gateway version 1.3.14.
                The security code must now be present in **~/.homebrige/config.json**.
* 2019-01-19 -  Added support for outlets.

## Useful Links

* https://www.reddit.com/r/tradfri/
