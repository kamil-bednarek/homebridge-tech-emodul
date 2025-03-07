import {PlatformAccessory} from 'homebridge';
import {TechEmodulHomebridgePlatform} from './platform';

export class TechModuleHumidityAccessory {
  private service;
  private name;

  constructor(
        private readonly accessory: PlatformAccessory,
        private readonly platform: TechEmodulHomebridgePlatform,
        private readonly directoryUrl: string) {

        // set accessory information
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
          .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Tech-Sterowniki')
          .setCharacteristic(this.platform.Characteristic.Model, 'Unknown')
          .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.description.id.toString());

        this.service = this.accessory.getService(this.platform.Service.HumiditySensor)
            || this.accessory.addService(this.platform.Service.HumiditySensor);

        this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.description.name);

        // extract name from config
        this.name = accessory.context.device.description.name;

        // create handlers for required characteristics
        this.service.getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
          .onGet(this.handleHumidityGet.bind(this));
  }

  /**
     * Handle requests to get the current value of the "humidity" characteristic
     */
  handleHumidityGet() {
    // this.platform.log.debug('Triggered GET humidity');
    if (this.platform.responses[this.directoryUrl]) {
      for (const element of this.platform.responses[this.directoryUrl].data.zones.elements) {
        if (element.zone.id === this.accessory.context.device.zone.id && element.zone.humidity !== null) {
          return element.zone.humidity;
        }
      }
    }
    return 0;
  }

}