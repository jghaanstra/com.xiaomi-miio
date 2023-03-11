'use strict';

const Homey = require('homey');
const miio = require('miio');
const tinycolor = require('tinycolor2');

class MiWifiDeviceDevice extends Homey.Device {

  async onInit() {}

  async bootSequence() {
    try {
      // VARIABLES GENERIC
      this.deviceFailures = 0;

      // CREATE DEVICE
      this.homey.setTimeout(() => { this.createDevice(); }, this.util.getRandomTimeout(10));

      // LOG DEVICE INFO
      this.homey.setTimeout(() => { this.getDeviceInfo(); }, 120000 + this.util.getRandomTimeout(10));

      // INITIAL REFRESH DEVICE
      this.homey.setTimeout(() => { this.refreshDevice(); }, this.util.getRandomTimeout(600));

      this.setUnavailable(this.homey.__('unreachable')).catch(error => { this.error(error) });
    } catch (error) {
      this.error(error);
    }
  }

  async onDeleted() {
    try {
      this.homey.clearInterval(this.pollingInterval);
      this.homey.clearInterval(this.refreshInterval);
      this.homey.clearTimeout(this.recreateTimeout);
      if (this.miio) { this.miio.destroy(); }
    } catch (error) {
      this.error(error);
    }
  }

  async onUninit() {
    try {
      this.homey.clearInterval(this.pollingInterval);
      this.homey.clearInterval(this.refreshInterval);
      this.homey.clearTimeout(this.recreateTimeout);
      if (this.miio) { this.miio.destroy(); }
    } catch (error) {
      this.error(error);
    }
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    if (changedKeys.includes("address") || changedKeys.includes("token") || changedKeys.includes("polling")) {
      this.refreshDevice();
      return Promise.resolve(true);
    }
  }

  // GENERIC CAPABILITY LISTENERS

  /* onoff */
  async onCapabilityOnoff(value, opts) {
    try {
      if (this.miio) {
        return await this.miio.setPower(value);
      } else {
        this.setUnavailable(this.homey.__('unreachable')).catch(error => { this.error(error) });
        this.createDevice();
        return Promise.reject('Device unreachable, please try again ...');
      }
    } catch (error) {
      this.error(error);
      return Promise.reject(error);
    }
  }

  /* dim */
  async onCapabilityDim(value, opts) {
    try {
      if (this.miio) {
        const brightness = value * 100;
        return await this.miio.setBrightness(brightness);
      } else {
        this.setUnavailable(this.homey.__('unreachable')).catch(error => { this.error(error) });
        this.createDevice();
        return Promise.reject('Device unreachable, please try again ...');
      }
    } catch (error) {
      this.error(error);
      return Promise.reject(error);
    }
  };

  /* vacuumcleaner onoff */
  async onCapabilityOnoffVacuumcleaner(value, opts) {
    try {
      if (this.miio) {
        if (value) {
          await this.miio.clean();
          return await this.setCapabilityValue('vacuumcleaner_state', 'cleaning');
        } else {
          await this.miio.stop();
          return this.setCapabilityValue('vacuumcleaner_state', 'stopped');
        }
      } else {
        this.setUnavailable(this.homey.__('unreachable')).catch(error => { this.error(error) });
        this.createDevice();
        return Promise.reject('Device unreachable, please try again ...');
      }
    } catch (error) {
      this.error(error);
      return Promise.reject(error);
    }
  }

  /* vacuumcleaner_state */
  async onCapabilityVacuumcleanerState(value, opts) {
    try {
      if (this.miio) {
        switch (value) {
          case "cleaning":
            await this.miio.clean();
            return await this.setCapabilityValue('onoff', true);
          case "spot_cleaning":
            await this.miio.spotClean();
            return await this.setCapabilityValue('onoff', true);
          case "stopped":
            await this.miio.stop();
            return await this.setCapabilityValue('onoff', false);
          case "docked":
          case "charging":
            await this.miio.stop();
            await this.miio.activateCharging();
            return await this.setCapabilityValue('onoff', false);
          default:
            this.error("Not a valid vacuumcleaner_state");
        }
      } else {
        this.setUnavailable(this.homey.__('unreachable')).catch(error => { this.error(error) });
        this.createDevice();
        return Promise.reject('Device unreachable, please try again ...');
      }
    } catch (error) {
      this.error(error);
      return Promise.reject(error);
    }
  };

  /* vacuumcleaner fanspeed */
  async onCapabilityVacuumFanspeed(value, opts) {
    try {
      if (this.miio) {
        return await this.miio.call("set_custom_mode", [Number(value)], { retries: 1 });
      } else {
        this.setUnavailable(this.homey.__('unreachable')).catch(error => { this.error(error) });
        this.createDevice();
        return Promise.reject('Device unreachable, please try again ...');
      }
    } catch (error) {
      this.error(error);
      return Promise.reject(error);
    }
  };

  /* vacuumcleaner mop intensity */
  async onCapabilityVacuumMopIntensity(value, opts) {
    try {
      if (this.miio) {
        return await this.miio.call("set_water_box_custom_mode", [Number(value)], { retries: 1 });
      } else {
        this.setUnavailable(this.homey.__('unreachable')).catch(error => { this.error(error) });
        this.createDevice();
        return Promise.reject('Device unreachable, please try again ...');
      }
    } catch (error) {
      this.error(error);
      return Promise.reject(error);
    }
  };

  /* button.consumables */
  async onCapabilityButtonConsumable(value, opts) {
    try {
      if (this.miio) {
        return await this.miio.call("reset_consumable", ["main_brush_work_time", "side_brush_work_time", "filter_work_time", "sensor_dirty_time"], { retries: 1 });
      } else {
        this.setUnavailable(this.homey.__('unreachable')).catch(error => { this.error(error) });
        this.createDevice();
        return Promise.reject('Device unreachable, please try again ...');
      }
    } catch (error) {
      this.error(error);
      return Promise.reject(error);
    }
  };

  // HELPER FUNCTIONS

  /* updating capabilities */
  async updateCapabilityValue(capability, value) {
    try {
      if (this.hasCapability(capability)) {
        if (value !== this.getCapabilityValue(capability) && value !== null && value !== 'null' && value !== 'undefined' && value !== undefined) {
          await this.setCapabilityValue(capability, value);
        }
      } else {
        if (!this.miio.matches('cap:children')) {
          this.log('adding capability '+ capability +' to '+ this.getData().id +' as the device seems to have values for this capability ...');
          await this.addCapability(capability);
          await this.setCapabilityValue(capability, value);
        }
      }
    } catch (error) {
      this.error('Trying to update or add capability', capability, 'with value', value, 'for device', this.getName(), 'with device id', this.getData().id);
      this.error(error);
    }
  }

  /* create device instance and start polling */
  async createDevice() {
    try {
      this.miio = await miio.device({ address: this.getSetting('address'), token: this.getSetting('token') });
      if (!this.getAvailable()) { this.setAvailable(); }
      this.startCapabilityListeners();
      this.pollDevice();
    } catch (error) {
      this.setUnavailable(this.homey.__('device.unreachable') + error.message).catch(error => { this.error(error) });
      this.deviceFailures++;
      if (this.deviceFailures <= 9) {
        this.recreateTimeout = this.homey.setTimeout(() => { this.createDevice();}, 10000);
      } else {
        this.deviceFailures = 0;
        this.recreateTimeout = this.homey.setTimeout(() => { this.createDevice();}, 600000);
      }
      this.error(error.message);
    }
  }

  /* refresh device instance on regular interval */
  async refreshDevice() {
    try {
      this.homey.clearInterval(this.refreshInterval);
      this.refreshInterval = this.homey.setInterval(() => {
        if (this.miio) { this.miio.destroy(); }
        this.homey.setTimeout(() => { this.createDevice(); }, 2000);
      }, 3600000 + this.util.getRandomTimeout(600));
    } catch (error) {
      this.setUnavailable(this.homey.__('device.unreachable') + error.message).catch(error => { this.error(error) });
      this.deviceFailures++;
      this.createDevice();
      this.error(error.message);
    }
  }

  /* log device info */
  async getDeviceInfo() {
    try {
      this.log("WiFi Device Init: " + this.getName() + " with ip "+ this.getSetting('address') + " and capabilities " + this.getCapabilities().toString() + " and model " + this.getStoreValue('model') + " and store values ", this.getStoreKeys().toString());
      if (this.miio) {
        if (this.miio.matches('cap:state')) {
          const states = await this.miio.state();
          for (const state in states) {
            await this.setStoreValue(state, states[state]);
          }
        }
      }
    } catch (error) {
      this.error(error);
    }
  }

  /* poll interval */
  async pollDevice() {
    try {
      this.homey.clearInterval(this.pollingInterval);
      this.homey.setTimeout(() => { this.retrieveDeviceData(); }, this.util.getRandomTimeout(5));
      let interval = this.getSetting('polling') || 60;
      this.pollingInterval = this.homey.setInterval(() => {
        this.retrieveDeviceData();
      }, 1000 * interval);
    } catch (error) {
      this.setUnavailable(this.homey.__('device.unreachable') + error.message).catch(error => { this.error(error) });
      this.deviceFailures++;
      this.createDevice();
      this.error(error);
    }
  }

  /* RETRIEVE DEVICE DATA THROUGH POLLING */
  async retrieveDeviceData() {
    try {

      // CAPABILITIES

      /* onoff */
      if (this.miio.matches('cap:power')) {
        const power = await this.miio.power();
        this.updateCapabilityValue('onoff', power);
      }

      /* measure_power */
      if (this.miio.matches('cap:power-load')) {
        const watt = await this.miio.powerLoad();
        this.updateCapabilityValue('measure_power', watt);
      }

      /* meter_power */
      if (this.miio.matches('cap:power-consumed')) {
        const wh = await this.miio.powerConsumed();
        const kwh = wh / 1000;
        this.updateCapabilityValue('meter_power', kwh);
      }

      /* measure_battery */
      if (this.miio.matches('cap:battery-level')) {
        const battery = await this.miio.batteryLevel();
        this.updateCapabilityValue('measure_battery', this.util.clamp(battery, 0, 100));
      }

      /* measure_temperature */
      if (this.miio.matches('cap:temperature')) {
        const temp = await this.miio.temperature();
        this.updateCapabilityValue('measure_temperature', temp.value);
      }

      /* measure_humidity */
      if (this.miio.matches('cap:relative-humidity')) {
        const rh = await this.miio.relativeHumidity();
        this.updateCapabilityValue('measure_humidity', rh);
      }

      /* measure_pm25 */
      if (this.miio.matches('cap:pm2.5')) {
        const aqi = await this.miio.pm2_5();
        this.updateCapabilityValue('measure_pm25', aqi);
      }

      /* measure_waterlevel */
      if (this.miio.matches('cap:depth')) {
        const value = await this.miio.depth();
        const waterlevel = this.util.clamp(Math.round(depth), 0, 100);
        if (this.getCapabilityValue('measure_waterlevel') !== waterlevel) {
          const previous_waterlevel = await this.getCapabilityValue('measure_waterlevel');
          await this.setCapabilityValue('measure_waterlevel', waterlevel);
          await this.homey.flow.getDeviceTriggerCard('humidifier2Waterlevel').trigger(this, {"waterlevel": waterlevel, "previous_waterlevel": previous_waterlevel }).catch(error => { this.error(error) });
        }
      }

      /* dim */
      if (this.miio.matches('cap:brightness')) {
        const brightness = await this.miio.brightness();
        const dim = brightness / 100;
        this.updateCapabilityValue('dim', dim);
      }

      /* measure_luminance */
      if (this.miio.matches('cap:illuminance')) {
        const luminance = await this.miio.illuminance();
        this.updateCapabilityValue('measure_luminance', luminance.value);
      }

      /* light_temperature */
      // not clear on how to set light_temperature from polling

      /* light_hue & light_saturation for child device */
      if (this.miio.matches('cap:children')) {
        if (this.miio.child('light').matches('cap:colorable')) {
          const color = await this.miio.child('light').color();

          const colorChanged = tinycolor({r: color.values[0], g: color.values[1], b: color.values[2]});
          const hsv = colorChanged.toHsv();
          const hue = Math.round(hsv.h) / 359;
          const saturation = Math.round(hsv.s);

          this.updateCapabilityValue('light_hue', hue);
          this.updateCapabilityValue('light_saturation', saturation);
        }
      }   

      // STORE VALUES

      /* mode */
      if (this.miio.matches('cap:mode')) {
        const mode = await this.miio.mode();
        if (this.getStoreValue('mode') !== mode && mode !== null) { this.setStoreValue('mode', mode); }       
      }

      /* state */
      if (this.miio.matches('cap:state')) {
        const states = await this.miio.state();
        for (const state in states) {
          await this.setStoreValue(state, states[state]);
        }
      }

      /* fanspeed */
      if (this.miio.matches('cap:fan-speed')) {
        const fanspeed = await this.miio.getState('fanSpeed');
        if (this.getStoreValue('fanspeed') !== fanspeed) { await this.setStoreValue('fanspeed', fanspeed); }
      }

      /* roll */
      if (this.miio.matches('cap:roll-angle')) {
        const angle = await this.miio.getState('roll');
        if (this.getStoreValue('angle') !== angle) { await this.setStoreValue('angle', angle); }
      }

      /* adjustable-roll-angle */
      if (this.miio.matches('cap:adjustable-roll-angle')) {
        const roll_angle = await this.miio.getState('roll_angle');
        if (this.getStoreValue('roll_angle') !== Number(roll_angle)) { await this.setStoreValue('roll_angle', Number(roll_angle)); }
      }

      /* switchable-child-lock */
      if (this.miio.matches('cap:switchable-child-lock')) {
        const child_lock = await this.miio.getState('child_lock');
        if (this.getStoreValue('child_lock') !== child_lock) { await this.setStoreValue('child_lock', child_lock); }
      }

      /* eyecare */
      if (this.miio.matches('cap:eyecare')) {
        const eyecare = await this.miio.eyeCare();
        if (this.getStoreValue('eyecare') !== eyecare) { await this.setStoreValue('eyecare', eyecare); }
      }

      // DEVICE TYPE SPECIFIC

      /* multifunction air monitor */
      if (this.getStoreValue('model') === 'cgllc.airmonitor.b1') {
        const data = await this.miio.call('get_air_data', []);
        data.co2 = data.co2e;
        ['temperature', 'humidity', 'pm25', 'tvoc', 'co2'].forEach(capability => {
          this.updateCapabilityValue(`measure_${capability}`, data[capability]);
        });
      }

      /* humidifier measure_power */
      if (this.hasCapability('humidifier2_mode')) {
        const mode = await this.miio.mode();
        let power = 0;
        switch (mode) {
          case 'idle':
            power = 2.4;
            break;
          case 'silent':
            power = 2.7;
            break;
          case 'medium':
            power = 3.4;
            break;
          case 'high':
            power = 4.8;
            break;
        }
        this.updateCapabilityValue('measure_power', power);

      }

      if (!this.getAvailable()) { this.setAvailable(); }

    } catch (error) {
      this.homey.clearInterval(this.pollingInterval);

      if (this.getAvailable()) {
        this.setUnavailable(this.homey.__('device.unreachable') + error.message).catch(error => { this.error(error) });
      }

      this.homey.setTimeout(() => { this.createDevice(); }, 60000);

      this.error(error);
    }
  }

  /* START CAPABILITY LISTENERS */
  async startCapabilityListeners() {
    try {

      // debugging
      // this.miio.on('stateChanged', (change) => {
      //   this.log(JSON.stringify(change));
      // });

      /* onoff */
      this.miio.on('powerChanged', onoff => {
        this.updateCapabilityValue('onoff', onoff);
      });

      /* measure_power */
      this.miio.on('powerLoadChanged', watt => {
        this.updateCapabilityValue('measure_power', watt);
      });

      /* meter_power */
      this.miio.on('powerConsumedChanged', wh => {
        const kwh = wh / 1000;
        this.updateCapabilityValue('meter_power', kwh);
      });

      /* measure_battery */
      this.miio.on('batteryLevelChanged', battery => {
        this.updateCapabilityValue('measure_battery', this.util.clamp(battery, 0, 100));
      });

      /* measure_temperature */
      this.miio.on('temperatureChanged', temp => {
        this.updateCapabilityValue('measure_temperature', temp.value);
      });

      /* measure_humidity */
      this.miio.on('relativeHumidityChanged', humidity => {
        this.updateCapabilityValue('measure_humidity', humidity);
      });

      /* measure_pm25 */
      this.miio.on('pm2.5Changed', aqi => {
        this.updateCapabilityValue('measure_pm25', aqi);
      });
      
      /* measure_luminance */
      this.miio.on('illuminanceChanged', illuminance => {
        this.updateCapabilityValue('measure_luminance', illuminance.value);
      });

      /* light_temperature */
      this.miio.on('colorChanged', c => {
        const light_temperature = this.util.normalize(c.values[0], 3000, 5700);
        this.updateCapabilityValue('light_temperature', light_temperature);
      });

      /* light_hue & light_saturation for child device */
      if (this.miio.matches('cap:childeren')) {
        this.miio.child('light').on('colorChanged', c => {
          const colorChanged = tinycolor({r: c.rgb.red, g: c.rgb.green, b: c.rgb.blue});
          const hsv = colorChanged.toHsv();
          const hue = Math.round(hsv.h) / 359;
          const saturation = Math.round(hsv.s);
    
          this.updateCapabilityValue('light_hue', hue);
          this.updateCapabilityValue('light_saturation', saturation);
        });
    
        /* dim */
        this.miio.child('light').on('brightnessChanged', brightness => {
          const dim = brightness / 100;
          this.updateCapabilityValue('dim', dim);
        });
      }

      /* mode */
      this.miio.on('modeChanged', mode => {
        this.handleModeEvent(mode);
      });
    } catch (error) {
      this.log(error);
    }
  }

  /* HANDLE MODE EVENTS, CAN BE OVERWRITTEN ON DEVICE LEVEL */
  async handleModeEvent(mode) {
    try {
      /* device with mode implemented as capability */
      if (this.hasCapability('airpurifier_mode')) {
        const previous_mode = this.getCapabilityValue('airpurifier_mode');
        if (previous_mode !== mode) {
          this.setCapabilityValue('airpurifier_mode', mode);
          this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": mode, "previous_mode": previous_mode.toString() }).catch(error => { this.error(error) });
        }
      }

      if (this.hasCapability('humidifier_mode')) {
        const previous_mode = this.getCapabilityValue('humidifier_mode');
        if (previous_mode !== mode) {
          this.setCapabilityValue('humidifier_mode', mode);
          this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": mode, "previous_mode": previous_mode.toString() }).catch(error => { this.error(error) });
        }
      }

      if (this.hasCapability('humidifier2_mode')) {
        const previous_mode = this.getCapabilityValue('humidifier2_mode');
        if (previous_mode !== mode) {
          this.setCapabilityValue('humidifier2_mode', mode);
          this.homey.flow.getDeviceTriggerCard('triggerModeChanged').trigger(this, {"new_mode": mode, "previous_mode": previous_mode.toString() }).catch(error => { this.error(error) });
        }
      }
    } catch (error) {
      this.error(error);
    }
  }

  /* VACUUMCLEANER STATE, CAN BE OVERWRITTEN ON DEVICE LEVEL */
  async vacuumCleanerState(state) {
    try {
      switch (state) {
        case 5:
          if (this.getCapabilityValue('vacuumcleaner_state') !== "cleaning") {
            await this.updateCapabilityValue("vacuumcleaner_state", "cleaning");
            await this.updateCapabilityValue("onoff", true);
            await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": "cleaning" }).catch(error => { this.error(error) });
          }
          break;
        case 11:
          if (this.getCapabilityValue('vacuumcleaner_state') !== "spot_cleaning") {
            await this.updateCapabilityValue("vacuumcleaner_state", "spot_cleaning");
            await this.updateCapabilityValue("onoff", true);
            await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": "spot_cleaning" }).catch(error => { this.error(error) });
          }
          break;
        case 3:
        case 10:
        case 13:
          if (this.getCapabilityValue('vacuumcleaner_state') !== "stopped") {
            await this.updateCapabilityValue("vacuumcleaner_state", "stopped");
            await this.updateCapabilityValue("onoff", false);
            await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": "stopped" }).catch(error => { this.error(error) });
          }
          break;
        case 15:
          if (this.getCapabilityValue('vacuumcleaner_state') !== "docked") {
            await this.updateCapabilityValue("vacuumcleaner_state", "docked");
            await this.updateCapabilityValue("onoff", false);
            await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": "docked" }).catch(error => { this.error(error) });
          }
          break;
        case 8:
          if (this.getCapabilityValue('measure_battery') === 100) {
            if (this.getCapabilityValue('vacuumcleaner_state') !== "docked") {
              await this.updateCapabilityValue("vacuumcleaner_state", "docked");
              await this.updateCapabilityValue("onoff", false);
              await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": "docked" }).catch(error => { this.error(error) });
            }
          } else {
            if (this.getCapabilityValue('vacuumcleaner_state') !== "charging") {
              await this.updateCapabilityValue("vacuumcleaner_state", "charging");
              await this.updateCapabilityValue("onoff", false);
              await this.homey.flow.getDeviceTriggerCard('statusVacuum').trigger(this, {"status": "charging" }).catch(error => { this.error(error) });
            }
          }
          break;
        default:
          this.log("Not a valid vacuumcleaner_state", state);
          break;
      }
    } catch (error) {
      this.error(error);
    }
  }

  /* VACUUMCLEANER CONSUMABLES, CAN BE OVERWRITTEN ON DEVICE LEVEL */
  async vacuumConsumables(consumables) {
    try {
      
      /* main_brush_work_time */
      const main_brush_remaining = (100 - Math.ceil((consumables[0]["main_brush_work_time"] / 1080000) * 100)+ "%");
      if (this.getSetting("main_brush_work_time") !== main_brush_remaining) {
        this.setSettings({ main_brush_work_time: main_brush_remaining });
        if (main_brush_remaining < this.getSetting("alarm_threshold")) {
          this.updateCapabilityValue("alarm_main_brush_work_time", true);
          await this.homey.flow.getDeviceTriggerCard('alertVacuum').trigger(this, {"consumable": "Main Brush", "value": main_brush_remaining }).catch(error => { this.error(error) });
        } else if (main_brush_remaining > this.getSetting("alarm_threshold") && this.getCapabilityValue('alarm_main_brush_work_time')) {
          this.updateCapabilityValue("alarm_main_brush_work_time", false);
        }
      }

      /* alarm_side_brush_work_time */
      const side_brush_remaining = (100 - Math.ceil((consumables[0]["side_brush_work_time"] / 720000) * 100)+ "%");
      if (this.getSetting("side_brush_work_time") !== side_brush_remaining) {
        this.setSettings({ side_brush_work_time: side_brush_remaining });
        if (side_brush_remaining < this.getSetting("alarm_threshold")) {
          this.updateCapabilityValue("alarm_side_brush_work_time", true);
          await this.homey.flow.getDeviceTriggerCard('alertVacuum').trigger(this, {"consumable": "Side Brush", "value": side_brush_remaining }).catch(error => { this.error(error) });
        } else if (side_brush_remaining > this.getSetting("alarm_threshold") && this.getCapabilityValue('alarm_side_brush_work_time')) {
          this.updateCapabilityValue("alarm_side_brush_work_time", false);
        }
      }

      /* filter_work_time */
      const filter_remaining = (100 - Math.ceil((consumables[0]["filter_work_time"] / 540000) * 100)+ "%");
      if (this.getSetting("filter_work_time") !== filter_remaining) {
        this.setSettings({ filter_work_time: filter_remaining });
        if (filter_remaining < this.getSetting("alarm_threshold")) {
          this.updateCapabilityValue("alarm_filter_work_time", true);
          await this.homey.flow.getDeviceTriggerCard('alertVacuum').trigger(this, {"consumable": "Filter", "value": filter_remaining }).catch(error => { this.error(error) });
        } else if (filter_remaining > this.getSetting("alarm_threshold") && this.getCapabilityValue('alarm_filter_work_time')) {
          this.updateCapabilityValue("alarm_filter_work_time", false);
        }
      }

      /* sensor_dirty_work_time */
      const sensor_dirty_remaining = (100 - Math.ceil((consumables[0]["sensor_dirty_time"] / 108000) * 100)+ "%");
      if (this.getSetting("sensor_dirty_time") !== sensor_dirty_remaining) {
        this.setSettings({ sensor_dirty_time: sensor_dirty_remaining });
        if (sensor_dirty_remaining < this.getSetting("alarm_threshold")) {
          this.updateCapabilityValue("alarm_sensor_dirty_time", true);
          await this.homey.flow.getDeviceTriggerCard('alertVacuum').trigger(this, {"consumable": "Sensor", "value": sensor_dirty_remaining }).catch(error => { this.error(error) });
        } else if (sensor_dirty_remaining > this.getSetting("alarm_threshold") && this.getCapabilityValue('alarm_sensor_dirty_time')) {
          this.updateCapabilityValue("alarm_sensor_dirty_time", false);
        }
      }

    } catch (error) {
      this.error(error);
    }
  }

  /* VACUUMCLEANER TOTALS, CAN BE OVERWRITTEN ON DEVICE LEVEL */
  async vacuumTotals(totals) {
    try {

      /* total_work_time */
      const total_work_time = Math.round(totals.clean_time / 3600) + " h";
      if (this.getSetting("total_work_time") !== total_work_time) {
        await this.setSettings({ total_work_time: total_work_time });
      }

      /* total_cleared_area */
      const total_cleared_area = Math.round(totals.clean_area / 1000000) + " m2";
      if (this.getSetting("total_cleared_area") !== total_cleared_area) {
        await this.setSettings({ total_cleared_area: total_cleared_area });
      }

      /* total_clean_count */
      if (this.getSetting("total_clean_count") !== totals.clean_count) {
        await this.setSettings({ total_clean_count: String(totals.clean_count) });
      }

    } catch (error) {
      this.error(error);
    }
  }

}

module.exports = MiWifiDeviceDevice;