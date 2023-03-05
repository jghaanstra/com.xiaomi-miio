'use strict';

const Homey = require('homey');
const Device = require('../wifi_device.js');
const Util = require('../../lib/util.js');

class IRRemoteDevice extends Device {

  async onInit() {
    try {
      if (!this.util) this.util = new Util({homey: this.homey});
      
      // GENERIC DEVICE INIT ACTIONS
      this.bootSequence();

      // DEVICE SPECIFIC VARIABLES
      this.data = this.getData();

      // LISTENERS FOR UPDATING CAPABILITIES
      this.registerCapabilityListener('onoff', async ( value ) => {
        try {
          if (value) {
            if (this.data && this.data.onoff1) {
              return await this.sendIrCode(this.data.onoff1);
            } else {
              return await this.sendIrCode(this.data.onoff);
            }
          } else {
            if (this.data && this.data.onoff2) {
              return await this.sendIrCode(this.data.onoff2);
            } else {
              return await this.sendIrCode(this.data.onoff);
            }
          }
          return Promise.resolve(true);
        } catch (error) {
          this.error(error);
          return Promise.reject(error);
        }
      });

      this.registerCapabilityListener('channel_up', async ( value ) => {
        try {
          return await this.sendIrCode(this.data.channel_up);
        } catch (error) {
          this.error(error);
          return Promise.reject(error);
        }
      });

      this.registerCapabilityListener('channel_down', async ( value ) => {
        try {
          return await this.sendIrCode(this.data.channel_down);
        } catch (error) {
          this.error(error);
          return Promise.reject(error);
        }
      });

      this.registerCapabilityListener('volume_up', async ( value ) => {
        try {
          return await this.sendIrCode(this.data.volume_up);
        } catch (error) {
          this.error(error);
          return Promise.reject(error);
        }
      });

      this.registerCapabilityListener('volume_down', async ( value ) => {
        try {
          return await this.sendIrCode(this.data.volume_down);
        } catch (error) {
          this.error(error);
          return Promise.reject(error);
        }
      });

      this.registerCapabilityListener('volume_mute', async ( value ) => {
        try {
          return await this.sendIrCode(this.data.volume_mute);
        } catch (error) {
          this.error(error);
          return Promise.reject(error);
        }
      });

      this.registerCapabilityListener('dim', async ( value ) => {
        try {
          if (this.data && this.data.dim1) {
            return await this.sendIrCode(this.data.dim + value);
          } else {
            return await this.sendIrCode(this.data.dim);
          }
        } catch (error) {
          this.error(error);
          return Promise.reject(error);
        }
      });

    } catch (error) {
      this.error(error);
    }
  }

  async sendIrCode(code) {
    try {
      const settings = this.getSettings();
      for (let i = 0; i < settings.replay; i++) {
        await this.util.sleep(500);
        await this.miio.call("miIO.ir_play", { freq: 38400, code: code });
      }
      return Promise.resolve(true);
    } catch (error) {
      this.error(error);
      return Promise.reject(error);
    }
  }

}

module.exports = IRRemoteDevice;
