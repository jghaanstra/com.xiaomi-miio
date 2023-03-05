'use strict';

module.exports = {
  async generate({homey, body}) {
    const result = await homey.app.generate(body);
    return result;
  },
  async testConnection({homey, body}) {
    const result = await homey.app.testConnection(body);
    return result;
  },
  async getGateways({homey, body}) {
    const result = await homey.app.getGateways();
    return result;
  }
}