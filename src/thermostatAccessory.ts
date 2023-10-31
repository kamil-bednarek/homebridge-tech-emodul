import {PlatformAccessory} from 'homebridge';
import {TechEmodulHomebridgePlatform} from './platform';

export class TechModuleThermostatAccessory {
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

        this.service = this.accessory.getService(this.platform.Service.Thermostat)
            || this.accessory.addService(this.platform.Service.Thermostat);

        this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.description.name);

        // extract name from config
        this.name = accessory.context.device.description.name;

        // create handlers for required characteristics
        this.service.getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
          .onGet(this.handleCurrentHeatingCoolingStateGet.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
        // .setProps({
        //   validValues: [
        //     // this.platform.Characteristic.TargetHeatingCoolingState.AUTO,
        //     this.platform.Characteristic.TargetHeatingCoolingState.HEAT,
        //     this.platform.Characteristic.TargetHeatingCoolingState.OFF,
        //     // this.platform.Characteristic.TargetHeatingCoolingState.COOL,
        //   ],
        // })
          .onGet(this.handleTargetHeatingCoolingStateGet.bind(this))
          .onSet(this.handleTargetHeatingCoolingStateSet.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
          .onGet(this.handleCurrentTemperatureGet.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.TargetTemperature)
          .onGet(this.handleTargetTemperatureGet.bind(this))
          .onSet(this.handleTargetTemperatureSet.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
          .onGet(this.handleTemperatureDisplayUnitsGet.bind(this))
          .onSet(this.handleTemperatureDisplayUnitsSet.bind(this));
  }

  /**
     * Handle requests to get the current value of the "Current Heating Cooling State" characteristic
     */
  handleCurrentHeatingCoolingStateGet() {
    if (this.platform.responses[this.directoryUrl]) {
      for (const element of this.platform.responses[this.directoryUrl].data.zones.elements) {
        if (element.zone.id === this.accessory.context.device.zone.id && element.zone.currentTemperature !== null) {
          if (element.zone.flags.relayState === 'on') {
            return this.platform.Characteristic.TargetHeatingCoolingState.HEAT;
          } else {
            return this.platform.Characteristic.TargetHeatingCoolingState.OFF;
          }
        }
      }
    }

    return this.platform.Characteristic.TargetHeatingCoolingState.OFF;
  }


  /**
     * Handle requests to get the current value of the "Target Heating Cooling State" characteristic
     */
  handleTargetHeatingCoolingStateGet() {
    // this.platform.log.debug('Triggered GET TargetHeatingCoolingState');
    if (this.platform.responses[this.directoryUrl]) {
      for (const element of this.platform.responses[this.directoryUrl].data.zones.elements) {
        if (element.zone.id === this.accessory.context.device.zone.id && element.zone.currentTemperature !== null) {
          if (element.zone.flags.relayState === 'on') {
            return this.platform.Characteristic.TargetHeatingCoolingState.HEAT;
          } else {
            return this.platform.Characteristic.TargetHeatingCoolingState.OFF;
          }
        }
      }
    }
    return this.platform.Characteristic.TargetHeatingCoolingState.OFF;
  }

  /**
     * Handle requests to set the "Target Heating Cooling State" characteristic
     */
  handleTargetHeatingCoolingStateSet(value) {
    this.platform.log.debug('Triggered SET TargetHeatingCoolingState:', value);
  }

  /**
     * Handle requests to get the current value of the "Current Temperature" characteristic
     */
  handleCurrentTemperatureGet() {
    // this.platform.log.debug('Triggered GET CurrentTemperature');
    if (this.platform.responses[this.directoryUrl]) {
      for (const element of this.platform.responses[this.directoryUrl].data.zones.elements) {
        if (element.zone.id === this.accessory.context.device.zone.id && element.zone.currentTemperature !== null) {
          return element.zone.currentTemperature / 10;
        }
      }
    }
    return 10;
  }


  /**
     * Handle requests to get the current value of the "Target Temperature" characteristic
     */
  handleTargetTemperatureGet() {
    // this.platform.log.debug('Triggered GET TargetTemperature');
    if (this.platform.responses[this.directoryUrl]) {
      for (const element of this.platform.responses[this.directoryUrl].data.zones.elements) {
        if (element.zone.id === this.accessory.context.device.zone.id && element.zone.setTemperature !== null) {
          return element.zone.setTemperature / 10;
        }
      }
    }
    return 10;
  }

  /**
     * Handle requests to set the "Target Temperature" characteristic
     */
  handleTargetTemperatureSet(value) {
    this.platform.axiosInstance.post(`${this.directoryUrl}/zones`, {
      mode: {
        id: this.accessory.context.device.mode.id,
        parentId: this.accessory.context.device.zone.parentId,
        mode: 'constantTemp',
        constTempTime: 0,
        setTemperature: value * 10,
        scheduleIndex: 0,
      },
    }).then(() => {
      this.platform.log.info(`Set temperature for ${this.accessory.context.device.description.name} success`, value);
      setTimeout(() => {
        this.platform.handleRefreshData(this.directoryUrl);
      }, 1000);
    }).catch((error) => {
      this.platform.log.error(`Set temperature for ${this.accessory.context.device.description.name} error`, error);
    });
  }

  /**
     * Handle requests to get the current value of the "Temperature Display Units" characteristic
     */
  handleTemperatureDisplayUnitsGet() {
    // this.platform.log.debug('Triggered GET TemperatureDisplayUnits');

    // set this to a valid value for TemperatureDisplayUnits
    const currentValue = this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS;

    return currentValue;
  }

  /**
     * Handle requests to set the "Temperature Display Units" characteristic
     */
  handleTemperatureDisplayUnitsSet(value) {
    this.platform.log.debug('Triggered SET TemperatureDisplayUnits:', value);
  }

}