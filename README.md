<p align="center">
<img src="https://github.com/homebridge/branding/raw/latest/logos/homebridge-wordmark-logo-vertical.png" width="150">
</p>

# Homebridge Tech-Sterowniki Platform Plugin (emodul.eu)

## Description

This Homebridge plugin is designed to integrate Tech-Sterowniki's EMODUL.EU devices into your HomeKit environment. By
installing this plugin, you can control and monitor your Tech-Sterowniki devices directly from the Home app on your iOS
device, as well as through Siri voice commands. The plugin aims to provide a seamless and user-friendly experience,
bringing smart control and automation to your Tech-Sterowniki devices.

## Features

- **Device Control**: Control your Tech-Sterowniki devices directly from the Home app.
- **Real-time Updates**: Receive real-time status updates from your devices.
- **Siri Integration**: Use Siri voice commands to control and check the status of your devices.
- **Easy Configuration**: Simple and straightforward setup process.

## Prerequisites

Before installing the Homebridge Tech-Sterowniki Platform Plugin, ensure you have the following:

- A running instance of [Homebridge](https://homebridge.io/) on your network.
- Tech-Sterowniki devices that are compatible with EMODUL.EU platform.
- Network access to your Tech-Sterowniki devices.

## Installation

1. Install Homebridge, if not already installed: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-tech-sterowniki-emodul`
3. Update your Homebridge `config.json` file (see below for an example).

## Configuration

Add the following configuration to the `platforms` array in your Homebridge `config.json` file:

```json
{
  "bridge": {
    "name": "Homebridge ...",
    "username": "00:00...",
    "port": 51314,
    "pin": "...",
    "advertiser": "bonjour-hap"
  },
  "accessories": [],
  "platforms": [
    {
      "name": "My home",
      "login": "test",
      "password": "test",
      "platform": "TechEmodulHomebridgePlugin",
      "apiUrl": "https://emodul.eu/api/v1/"
    }
  ]
}
```

### Usage

Once installed and configured, your Tech-Sterowniki devices should appear in the Home app. You can control them like any
other HomeKit accessory. Use Siri voice commands for quick actions and status checks.

### Troubleshooting

If you experience issues with the plugin, please check the following:

Ensure that your Homebridge instance is running and accessible.
Verify that your Tech-Sterowniki devices are online and reachable on the network.
Check your Homebridge logs for any error messages or issues related to the plugin.
Ensure that your config.json file is correctly configured.

### Contributing

If you would like to contribute to the development of this plugin, please submit a pull request or create an issue on
the GitHub repository.

### License

This Homebridge plugin is released under the Apache-2.0 license.

### Contact

For any questions or support, please open an issue on the GitHub repository.

Enjoy controlling your Tech-Sterowniki devices with HomeKit!
