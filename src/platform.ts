import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {
  API,
  Characteristic,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
} from 'homebridge';
import {PLATFORM_NAME, PLUGIN_NAME} from './settings';
import {AuthenticationResponse} from './dto/authentication.response';
import {ModulesResponse} from './dto/modules.response';
import {TechModuleThermostatAccessory} from './thermostatAccessory';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class TechEmodulHomebridgePlatform implements DynamicPlatformPlugin {
  public axiosInstance: AxiosInstance;
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public accessToken?: string;
  public userId?: number;
  public responses = {};

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
        public readonly log: Logger,
        public readonly config: PlatformConfig,
        public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.axiosInstance = axios.create({
      baseURL: this.config.apiUrl ?? 'https://emodul.eu/api/v1/',
      timeout: 30000,
    });

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.axiosInstance.post('authentication', {
        username: this.config.login,
        password: this.config.password,
      }).then((response: AxiosResponse<AuthenticationResponse>) => {
        this.accessToken = response.data.token;
        this.userId = response.data.user_id;

        this.axiosInstance = axios.create({
          baseURL: this.config.apiUrl ?? 'https://emodul.eu/api/v1/',
          timeout: 30000,
          headers: {'Authorization': `Bearer ${this.accessToken}`},
        });
      }).then(() => {
        // When this event is fired it means Homebridge has restored all cached accessories from disk.
        // Dynamic Platform plugins should only register new accessories after this event was fired,
        // in order to ensure they weren't added to homebridge already. This event can also be used
        // to start discovery of new accessories.
        // run the method to discover / register your devices as accessories
        this.discoverDevices();
      });
    });


  }

  /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  handleRefreshData(url) {
    this.axiosInstance.get(url)
      .then((response: AxiosResponse) => {
        this.responses[url] = response;
      })
      .catch((error) => {
        this.log.error('Refresh data error', error);
      });
  }

  /**
     * This is an example method showing how to register discovered accessories.
     * Accessories must only be registered once, previously created accessories
     * must not be registered again to prevent "duplicate UUID" errors.
     */
  discoverDevices() {
    this.axiosInstance.get(`users/${this.userId}/modules`).then((response: AxiosResponse<ModulesResponse[]>) => {
      for (const module of response.data) {
        this.log.debug('Module discovered', module.version);
        this.log.debug('Module uuid', module.udid);

        this.axiosInstance.get(`users/${this.userId}/modules/${module.udid}`)
          .then((response: AxiosResponse) => {
            const directoryUrl = `users/${this.userId}/modules/${module.udid}`;

            this.handleRefreshData(directoryUrl);
            setInterval(() => {
              this.handleRefreshData(directoryUrl);
            }, 5000);

            for (const element of response.data.zones.elements) {
              if (element.description.name.length <= 0) {
                continue;
              }
              const uuid = this.api.hap.uuid.generate(`${element.zone.id}_${element.zone.parentId}`);
              this.log.debug('Element discovered', element.description.name);
              this.log.debug('Element current temperature', element.zone.currentTemperature / 100);
              this.log.debug('Element set temperature', element.zone.setTemperature / 100);
              const existing = this.accessories.find(accessory => accessory.UUID === uuid);

              if (existing) {
                this.log.info('Restoring accessory:', element.description.name);
                this.api.updatePlatformAccessories([existing]);
                new TechModuleThermostatAccessory(existing, this, directoryUrl);
              } else {
                this.log.info('Adding new accessory:', element.description.name);
                this.log.info('Adding new accessory ID:', uuid);
                // create a new accessory
                const accessory = new this.api.platformAccessory(element.description.name, uuid);
                accessory.context.device = element;
                new TechModuleThermostatAccessory(accessory, this, directoryUrl);

                // link the accessory to your platform
                this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
              }
            }
          });
      }
    }).catch((error) => {
      this.log.error('Discover devices error', error);
    });
  }
}
