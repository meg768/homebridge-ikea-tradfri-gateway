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

## Note (2018-01-26)
This does not work with the latest firmware update
of the Trådfri Gateway. As of now, the latest version does not
allow you to add remote controls or dimmers to the
TRADFRI app (at least in the iOS version) so this plugin
was designed for gateway version 1.1.0015 to both be able
to work correctly in the TRADFRI app and work with the Apple Home app.
It will probably work for any version between 1.1.0015 and less than 1.2.42.

The problem is that the gateway automatically updates to the
latest version if you do not block it.
[Here](https://www.reddit.com/r/tradfri/comments/7p80wd/new_firmware_1314_megathread_issues_fixes_bugs/dshxwm2)
is a solution to that. Things will of course change in the future and hopefully this plugin
will be obsolete some day.

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

The following IKEA lighbulbs are supported

- Standard white bulbs
- RGB bulbs
- Warm white bulbs with temperature control

After this, start **homebridge**, scan the presented code with your iPhone, and hopefully
you will se all you IKEA lightbulbs in your iPhone/iPad Home app.


## To Do

* Find out gateway version and act accordingly
* Support motion sensors and remote controls if possible
* Handle reboot or connection break of gateway

## Bugfixes

* 2018-01-29 - Can now have accessories with the same name in the IKEA app
