"use strict";
const Homey = require("homey");

module.exports = [
  {
    method: "POST",
    path: "/generate",
    fn: async (args, callback) => {
      await Homey.app
        .generate(args)
        .then(res => {
          callback(null, res);
        })
        .catch(error => {
          callback(error, null);
        });
    }
  },
  {
    method: "POST",
    path: "/testConnection",
    fn: async (args, callback) => {
      await Homey.app
        .testConnection(args)
        .then(res => {
          callback(null, res);
        })
        .catch(error => {
          callback(error, null);
        });
    }
  },
  {
    method: "GET",
    path: "/getGateways",
    fn: async (args, callback) => {
      await Homey.app
        .getGateways()
        .then(res => {
          callback(null, res);
        })
        .catch(error => {
          callback(error, null);
        });
    }
  },
  {
    method: "POST",
    path: "/removeChildDevice",
    fn: async (args, callback) => {
      await Homey.app
        .removeChildDevice(args.body.gatewaySid, args.body.childSid)
        .then(res => {
          callback(null, res);
        })
        .catch(error => {
          callback(error, null);
        });
    }
  }
];
