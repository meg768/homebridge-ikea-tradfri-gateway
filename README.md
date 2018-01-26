# homebridge-ikea-tradfri-gateway

A HomeBridge plugin for the IKEA Trådfri Gateway.

NOTE (2018-01-26) - This does not work with the latest firmware update
of the Trådfri Gateway. As of now, the latest version does not
allow you to add remote controls or dimmers to the
TRADFRI app (at least in the iOS version) so this plugin
was designed to both be able to work correctly in the TRADFRI app
and work with the Apple Home app.

Things will of course change in the future...

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
            "psk" : "xxxxxxx"
        }
    ]


}

```
## What This Plugin Does

This plugin simply extracts all lightbulbs currently in use by the IKEA Trådfri
Gateway and exposes them to HomeKit and you have the ability to turn the
bulbs on or off. And, of course, you may change the device names and
group them into rooms on your iPhone or iPad.

The following IKEA lighbulbs supported

- Standard white bulbs
- Warm white bulbs with temperature control

After this, start **homebridge**, scan the presented code with your iPhone, and hopefully
you will se all you IKEA lightbulbs in your iPhone/iPad Home app.
