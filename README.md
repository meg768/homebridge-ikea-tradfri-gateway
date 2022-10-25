# homebridge-ikea-tradfri-gateway

Yet another HomeBridge plugin for the IKEA Trådfri Gateway.

**Please note that this module is no longer supported by me.
However, I will continue to merge pull request but I
do not have the ability to test anything.**

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

If you are having permission problems during install, try this

    $ sudo npm install homebridge-ikea-tradfri-gateway -g --unsafe-perm

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
            "securityCode" : "this-is-found-on-the-back-of-the-gateway",
            "expose": ["lightbulbs", "outlets", "blinds", "airPurifiers"]
        }
    ]
}

```
> You can also only expose non-IKEA devices (which are not exposed to HomeKit with the native integration) with:  
> "expose: ["non-ikea-lightbulbs", "non-ikea-outlets", "non-ikea-blinds", "non-ikea-airPurifiers"]

This module auto detects the ip address of the IKEA gateway. If by
some reason you would like to access a specific gateway, merge the following into 
**~/.homebridge/config.json**.


```javascript
{
    ...
    "platforms": [
        {
            ...
            "host": "ip-address-of-ikea-gateway"
        }
    ]
}

```


## What This Plugin Does

This plugin simply extracts all lightbulbs, outlets and blinds currently in use by the IKEA Trådfri
Gateway and exposes them to HomeKit and you have the ability to turn the
devices on or off. And, of course, you may change the device names and
group them into rooms on your iPhone or iPad.



The following IKEA devices are supported

- Standard white bulbs
- RGB bulbs
- Warm white bulbs with temperature control
- Outlets
- Blinds
- Air purifier (BETA)

After this, start **homebridge**, scan the presented code with your iPhone, and hopefully
you will se all you IKEA lightbulbs in your iPhone/iPad Home app.

## To Do

* Support motion sensors and remote controls if possible
* Handle reboot or connection break of gateway
* Refining purifier function

## Bugfixes/Updates

* 2018-01-29 - Can now have accessories with the same name in the IKEA app
* 2018-02-04 - Updated to work with gateway version 1.3.14.
               The security code must now be present in **~/.homebrige/config.json**.
* 2019-01-19 - Added support for outlets.
* 2019-08-19 - Added support for blinds.
* 2019-08-25 - Added support for auto detecting the IKEA gateway. 
               The **host** property in **~/.homebridge/config.json** is no longer required.
* 2019-11-27 - Added support for non IKEA devices. 
* 2021-05-30 - Updated dependencies in package.json
* 2022-10-26 - Added support for air purifiers.

## Useful Links

* https://www.reddit.com/r/tradfri/
