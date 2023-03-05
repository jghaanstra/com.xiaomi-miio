var devices = {
  tv: {
    name: "TV",
    capabilities: ["onoff", "volume_up", "volume_down", "channel_up", "channel_down", "volume_mute"],
    capabilitiesOptions: {
      onoff: {
        title: {
          en: "Standby"
        }
      },
      volume_up: {
        title: {
          en: "Volume UP"
        }
      },
      volume_down: {
        title: {
          en: "Volume DOWN"
        }
      },
      channel_up: {
        title: {
          en: "Channel UP"
        }
      },
      channel_down: {
        title: {
          en: "Channel DOWN"
        }
      },
      volume_mute: {
        title: {
          en: "Volume MUTE"
        }
      }
    },
    defaultCapabilities: ["onoff"],
    characteristicsSettings: {
      onoff: 1
    }
  },
  projector: {
    name: "Projector",
    capabilities: ["onoff"],
    capabilitiesOptions: {
      onoff: {
        title: {
          en: "Standby"
        }
      }
    },
    defaultCapabilities: ["onoff"],
    characteristicsSettings: {
      onoff: 1
    }
  },
  airConditioner: {
    name: "Air Conditioner",
    class: "thermostat",
    capabilities: ["onoff", "thermostat"],
    capabilitiesOptions: {
      onoff: {
        title: {
          en: "Standby"
        }
      }
    },
    defaultCapabilities: ["onoff"],
    characteristicsSettings: {
      onoff: 1,
      thermostat: {
        heat: true,
        cold: true,
        auto: true
      }
    }
  },
  amplifier: {
    name: "Amplifier",
    capabilities: ["onoff", "volume_mute", "volume_up", "volume_down"],
    capabilitiesOptions: {
      onoff: {
        title: {
          en: "Standby"
        }
      }
    },
    defaultCapabilities: ["onoff"],
    characteristicsSettings: {
      onoff: 1
    }
  },
  fan: {
    name: "FAN",
    capabilities: ["onoff", "dim"],
    capabilitiesOptions: {
      onoff: {
        title: {
          en: "Standby"
        }
      },
      dim: {
        title: {
          en: "Fan speed"
        },
        min: 0,
        max: 1,
        step: 1
      }
    },
    defaultCapabilities: ["onoff"],
    characteristicsSettings: {
      onoff: 1,
      dim: 1
    }
  }
};
