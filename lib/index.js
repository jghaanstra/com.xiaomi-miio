const EventEmitter = require("events");
const dgram = require("dgram");
const crypto = require("crypto");
const OptionsUtil = require("./OptionsUtil");
const GatewayUtil = require("./GatewayUtil");
const DeviceUtil = require("./DeviceUtil");

class MiHub extends EventEmitter {
  constructor(log) {
    super();
    this.setMaxListeners(Infinity);
    this.log = log;
    this.GatewayUtil = new GatewayUtil();
    this.DeviceUtil = new DeviceUtil();
    this.OptionsUtil = {};
    this.debug = false;
    this._promises = {};
    this.started = false;
  }

  initialize(options) {
    this.OptionsUtil = new OptionsUtil(options);
    this.debug = options.debug;
    this.createLANProtocolServerSocket();
    this.initializeLANProtocolServer();
    this.sendWhoisCommand();
    this.searchGateway = setInterval(this.sendWhoisCommand.bind(this), this.OptionsUtil.getSearchGatewayInterval());
  }

  start(options) {
    this.initialize(options);
  }

  stop() {
    clearInterval(this.searchGateway);
    this.GatewayUtil.clearGateways();
    this.DeviceUtil.clearDevice();
    this.LANProtocolServerSocket.close();
  }

  createLANProtocolServerSocket() {
    this.LANProtocolServerSocket = dgram.createSocket({
      type: "udp4",
      reuseAddr: true
    });
  }

  initializeLANProtocolServer() {
    this.LANProtocolServerSocket.on("error", err => this.log(`Error, msg - ${err.message}, stack - ${err.stack}\n`));
    this.LANProtocolServerSocket.on("close", () => {
      this.log("Socket is closed!");
      this.started = false;
    });

    this.LANProtocolServerSocket.on("listening", () => {
      if (null == this.OptionsUtil.getBindAddress()) {
        this.LANProtocolServerSocket.addMembership(this.OptionsUtil.multicastAddress);
      } else {
        this.LANProtocolServerSocket.setMulticastInterface(this.OptionsUtil.getBindAddress());
        this.LANProtocolServerSocket.addMembership(this.OptionsUtil.multicastAddress, this.OptionsUtil.getBindAddress());
      }
      this.log(`LAN protocol server is listening on port: ${this.OptionsUtil.muticastPort}`);
      this.started = true;
    });
    this.LANProtocolServerSocket.on("message", this.parseMessage.bind(this));

    this.LANProtocolServerSocket.bind(this.OptionsUtil.serverPort);
  }

  parseMessage(message, rinfo) {
    let data, cmd, sid;
    try {
      data = JSON.parse(message);
    } catch (error) {
      this.log(`Bad message: ${message} ${error}`);
      return;
    }

    if (data.hasOwnProperty("cmd")) {
      cmd = data.cmd;
    }

    if (data.hasOwnProperty("sid")) {
      sid = data.sid;
    }

    if (cmd === "iam" || cmd === "virtual_iam") {
      if (this.debug) {
        this.log("[iam] [Message] ", data);
      }
      let gatewaySid = data.sid;
      if (this.OptionsUtil.isConfigGateway(gatewaySid)) {
        if (this.OptionsUtil.isHostGateway(gatewaySid) && cmd != "virtual_iam") {
          return;
        }

        let gateway = this.GatewayUtil.getBySid(gatewaySid);
        if (!gateway) {
          gateway = {
            sid: gatewaySid,
            password: this.OptionsUtil.getGatewayPasswordByGatewaySid(gatewaySid),
            ip: data.ip,
            port: data.port
          };

          gateway = this.GatewayUtil.addOrUpdate(gatewaySid, gateway);

          if (!this.DeviceUtil.getBySid(gatewaySid)) {
            let gatewayDevice = {
              sid: gatewaySid,
              gatewaySid,
              lastUpdateTime: Date.now()
            };
            this.DeviceUtil.addOrUpdate(gatewaySid, gatewayDevice);

            let command = '{"cmd":"read", "sid":"' + gatewaySid + '"}';
            this.sendReadCommand(gatewaySid, command, { timeout: 0.5 * 60 * 1000, retryCount: 12 })
              .then(result => {
                this.DeviceUtil.addOrUpdate(result.sid, { model: result.model });

                let proto_version = null;
                try {
                  if ("read_ack" === result.cmd) {
                    let data = result.data;
                    proto_version = data && JSON.parse(data)["proto_version"];
                  } else if ("read_rsp" === result.cmd) {
                    let params = result.params;
                    if (params) {
                      for (let i in params) {
                        if (params[i]["proto_version"]) {
                          proto_version = params[i]["proto_version"];
                          break;
                        }
                      }
                    }
                  } else {
                  }

                  gateway = this.GatewayUtil.addOrUpdate(gatewaySid, {
                    proto_version: proto_version,
                    model: result.model,
                    modelInfo: this.DeviceUtil.getModelInfo(result.model)
                  });

                  let listCmd = this.getCmdListByProtoVersion(proto_version);
                  if (listCmd) {
                    if (this.debug) {
                      this.log("[Send]", listCmd);
                    }

                    this.LANProtocolServerSocket.send(listCmd, 0, listCmd.length, data.port, data.ip);
                  }
                } catch (error) {
                  if (this.debug) {
                    this.log(error);
                  }
                }
              })
              .catch(error => {
                this.DeviceUtil.remove(gatewaySid);
                this.log(error);
              });
          }
        } else {
          let proto_version = gateway.proto_version;
          let listCmd = this.getCmdListByProtoVersion(proto_version);
          if (listCmd) {
            if (this.debug) {
              this.log("[Send]", listCmd);
            }

            this.LANProtocolServerSocket.send(listCmd, 0, listCmd.length, data.port, data.ip);
          }
        }
      }
    } else if (cmd === "get_id_list_ack" || cmd === "discovery_rsp") {
      if (this.debug) {
        this.log("[get_id_list_ack] [Message] ", data);
      }

      let gatewaySid = data.sid;

      let gateway = this.GatewayUtil.getBySid(gatewaySid);
      if (gateway) {
        this.GatewayUtil.addOrUpdate(gatewaySid, {
          token: data.token,
          childDevices: JSON.parse(data.data).map(sid => this.DeviceUtil.getBySid(sid) || { sid })
        });

        let deviceSids = this.getDeviceListByJsonObj(data, gateway.proto_version);

        let index = 0;
        let sendInterval = setInterval(() => {
          if (index >= deviceSids.length) {
            if (this.debug) {
              this.log("[Info] Read gateway (" + gatewaySid + ") device list finished. size: " + index);
            }

            clearInterval(sendInterval);
            return;
          }

          let deviceSid = deviceSids[index];
          if (!this.DeviceUtil.getBySid(deviceSid)) {
            let device = {
              sid: deviceSid,
              gatewaySid,
              model: data.model,
              lastUpdateTime: Date.now()
            };

            this.DeviceUtil.addOrUpdate(deviceSid, device);
          }

          let command = '{"cmd":"read", "sid":"' + deviceSid + '"}';
          if (this.debug) {
            this.log("[Info] Read gateway (" + gatewaySid + ") devices, device is " + deviceSid + ", " + index + " - device");
          }
          this.sendReadCommand(deviceSid, command, { timeout: 3 * 1000, retryCount: 12 })
            .then(result => {
              this.emit(result.sid, result);
              this.DeviceUtil.addOrUpdate(result.sid, { model: result.model, data: JSON.parse(result.data), modelInfo: this.DeviceUtil.getModelInfo(result.model) || { name: "unknownModel" } });
              this.GatewayUtil.setChildren(gatewaySid, result);
            })
            .catch(error => {
              this.DeviceUtil.remove(deviceSid);
              this.log(error);
            });

          index++;
        }, 50);
      }
    } else if (cmd === "heartbeat") {
      if (this.debug) {
        this.log("[heartbeat] [Message] ", data);
      }

      this.GatewayUtil.update(sid, { token: data.token });

      let device = this.DeviceUtil.getBySid(sid);
      if (device) {
        let newLastUpdateTime = Date.now();
        this.emit(device.sid, data);
        this.DeviceUtil.update(sid, { lastUpdateTime: newLastUpdateTime });
      }
    } else if (cmd === "write_ack" || cmd === "write_rsp") {
      if (this.debug) {
        this.log("[write_ack] [Message] ", data);
      }
      let msgTag = "write_" + data.sid;
      const p = this.getPromises(msgTag);
      if (!p) {
        this.log("[Revc]", data);
        return;
      } else {
        if (data.data && data.data.indexOf("error") > -1) {
          p.reject(new Error(JSON.parse(data.data)["error"]));
        } else if (data.data && data.data.indexOf('"unknown"') > -1 && data.data.indexOf('"on"') == -1 && data.data.indexOf('"off"') == -1) {
          p.reject(new Error(data.data));
        } else {
          p.resolve(data);
        }
      }
    } else if (cmd === "read_ack" || cmd === "read_rsp") {
      if (this.debug) {
        this.log("[read_ack] [Message]", data);
      }
      let msgTag = "read_" + data.sid;
      const p = this.getPromises(msgTag);

      if (!p) {
        this.log("[Revc]", data);
        return;
      } else {
        if (data.data && data.data.indexOf("error") > -1) {
          p.reject(new Error(JSON.parse(data.data)["error"]));
        } else {
          p.resolve(data);
        }
      }
    } else if (cmd === "report") {
      if (this.debug) {
        this.log("[report] [Message] ", data);
      }

      if (this.DeviceUtil.getBySid(data.sid)) {
        this.emit(data.sid, data);
      }
    } else {
      if (this.debug) {
        this.log("[Message]", data);
      }
    }
  }

  sendWhoisCommand() {
    let hosts = this.OptionsUtil.getHosts();
    let gateways = this.OptionsUtil.getGateways();

    if (Object.getOwnPropertyNames(hosts).length > 0) {
      for (let key in hosts) {
        let vMsg = '{"cmd":"virtual_iam","sid":"' + key + '","port":"' + hosts[key]["port"] + '","ip":"' + hosts[key]["ip"] + '"}';
        this.parseMessage(vMsg, null);
      }
    }

    if (Object.getOwnPropertyNames(hosts).length < Object.getOwnPropertyNames(gateways).length) {
      let whoisCommand = '{"cmd": "whois"}';
      if (this.debug) {
        this.log("[Send]", whoisCommand);
      }
      this.LANProtocolServerSocket.send(whoisCommand, 0, whoisCommand.length, this.OptionsUtil.muticastPort, this.OptionsUtil.multicastAddress);
    }
  }

  sendReadCommand(deviceSid, command, options) {
    return new Promise((resolve, reject) => {
      let device = this.DeviceUtil.getBySid(deviceSid);
      let gateway = this.GatewayUtil.getBySid(device.gatewaySid);
      let msgTag = "read_" + deviceSid + "_t" + this.getPromisesTagSerialNumber();
      this.sendCommand(gateway.ip, gateway.port, msgTag, command, options)
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  getPromisesTagSerialNumber() {
    if (null == this.PromisesTagSerialNumber) {
      this.PromisesTagSerialNumber = {
        time: this.dateFormat(),
        num: 0
      };
    } else {
      if (this.dateFormat() != this.PromisesTagSerialNumber.time) {
        this.PromisesTagSerialNumber.time = this.dateFormat();
        this.PromisesTagSerialNumber.num = 0;
      }
    }
    return this.PromisesTagSerialNumber.time + this.PromisesTagSerialNumber.num++;
  }

  sendCommand(ip, port, msgTag, msg, options) {
    return new Promise((resolve, reject) => {
      if (!this.PromisesSendCommand) {
        this.PromisesSendCommand = {};
      }

      const triggerCorrelationPromises = (fun, res) => {
        let promisesSendCommands = this.PromisesSendCommand[ip + port + msg];
        if (promisesSendCommands) {
          promisesSendCommands = promisesSendCommands.concat();
          delete this.PromisesSendCommand[ip + port + msg];
          promisesSendCommands.forEach((promisesSendCommand, index, arr) => {
            const p = this._promises[promisesSendCommand];
            if (p) {
              p[fun](res);
            }
          });
        }
      };

      let retryLeft = (options && options.retryCount) || 3;
      const send = () => {
        retryLeft--;
        if (this.debug) {
          this.log("[Send]", msg);
        }
        if (this.started) {
          this.LANProtocolServerSocket.send(msg, 0, msg.length, port, ip, err => err && reject(err));
        }
      };
      const _sendTimeout = setInterval(() => {
        if (retryLeft > 0) {
          send();
        } else {
          clearInterval(_sendTimeout);
          delete this._promises[msgTag];
          let err = new Error("timeout: " + msg);
          triggerCorrelationPromises("reject", err);
          reject(err);
        }
      }, (options && options.timeout) || 1 * 1000);

      this._promises[msgTag] = {
        resolve: res => {
          clearInterval(_sendTimeout);
          delete this._promises[msgTag];
          triggerCorrelationPromises("resolve", res);
          resolve(res);
        },
        reject: err => {
          clearInterval(_sendTimeout);
          delete this._promises[msgTag];
          triggerCorrelationPromises("reject", err);
          reject(err);
        }
      };

      if (this.PromisesSendCommand[ip + port + msg]) {
        this.PromisesSendCommand[ip + port + msg].push(msgTag);
      } else {
        this.PromisesSendCommand[ip + port + msg] = [];
        send();
      }
    });
  }

  dateFormat() {
    let dateData = new Date();
    let day = dateData.getDate();
    let month = dateData.getMonth();
    let year = dateData.getFullYear();
    let minutes = dateData.getMinutes();
    let hours = dateData.getHours();
    let seconds = dateData.getSeconds();

    let formattedDate = year + month + day + hours + minutes + seconds;
    return formattedDate;
  }

  getPromises(msgTag) {
    let resultTag = null;
    for (let promisesTag in this._promises) {
      if (promisesTag.indexOf(msgTag) > -1) {
        if (null == resultTag || Number(resultTag.slice(resultTag.indexOf("_t") + 2)) > Number(promisesTag.slice(promisesTag.indexOf("_t") + 2))) {
          resultTag = promisesTag;
        }
      }
    }
    return this._promises[resultTag];
  }

  getProtoVersionPrefixByProtoVersion(proto_version) {
    if (proto_version) {
      let dotIndex = proto_version.indexOf(".");
      if (dotIndex > 0) {
        return proto_version.substring(0, dotIndex);
      }
    }

    return null;
  }

  getCmdListByProtoVersion(proto_version) {
    let listCmd = null;
    let proto_version_prefix = this.getProtoVersionPrefixByProtoVersion(proto_version);
    if (1 == proto_version_prefix) {
      listCmd = '{"cmd":"get_id_list"}';
    } else if (2 == proto_version_prefix) {
      listCmd = '{"cmd":"discovery"}';
    } else {
    }

    return listCmd;
  }

  getDeviceListByJsonObj(data, proto_version) {
    let deviceList = [];
    let proto_version_prefix = this.getProtoVersionPrefixByProtoVersion(proto_version);
    if (1 == proto_version_prefix) {
      deviceList = JSON.parse(data.data);
    } else if (2 == proto_version_prefix) {
      for (let i in data.dev_list) {
        deviceList.push(data.dev_list[i].sid);
      }
    } else {
    }

    return deviceList;
  }

  getGateways() {
    return this.GatewayUtil.getAll();
  }

  getDevices() {
    return this.DeviceUtil.getAll();
  }

  getDevicesByModel(models) {
    const devices = this.getDevices();

    return Promise.resolve(Object.values(devices).filter(device => models.includes(device.model)));
  }

  getGatewaysByModel(models) {
    const gateways = this.getGateways();

    return Promise.resolve(Object.values(gateways).filter(gateway => models.includes(gateway.model)));
  }

  sendWriteCommand(deviceSid, command, options) {
    return new Promise((resolve, reject) => {
      let device = this.DeviceUtil.getBySid(deviceSid);
      let gateway = this.GatewayUtil.getBySid(device.gatewaySid);

      let cipher = crypto.createCipheriv("aes-128-cbc", this.OptionsUtil.getGatewayPasswordByGatewaySid(gateway["sid"]), this.OptionsUtil.iv);
      let gatewayToken = gateway["token"];
      let key = cipher.update(gatewayToken, "ascii", "hex");
      cipher.final("hex");
      command = command.replace("${key}", key);

      let msgTag = "write_" + deviceSid + "_t" + this.getPromisesTagSerialNumber();
      this.sendCommand(gateway.ip, gateway.port, msgTag, command, options)
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  getDeviceModelBySid(sid) {
    let device = this.DeviceUtil.getBySid(sid);
    if (device) {
      return device.model;
    }

    return null;
  }
}

module.exports = MiHub;
