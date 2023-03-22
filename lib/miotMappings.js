'use strict';

class miotMappings {

  static miotMappings = {
    "vacuum": {
      "dreame.vacuum.mc1808": {
        "capabilities": ["onoff", "measure_battery"],
        "capability_map": {
          "onoff": "cleaning_mode",
          "measure_battery": "battery_level"
        },
        "mapping": {
          // https://home.miot-spec.com/spec/dreame.vacuum.mc1808
          "battery_level": {"siid": 2, "piid": 1},
          "charging_state": {"siid": 2, "piid": 2},
          "device_fault": {"siid": 3, "piid": 1},
          "device_status": {"siid": 3, "piid": 2},
          "brush_left_time": {"siid": 26, "piid": 1},
          "brush_life_level": {"siid": 26, "piid": 2},
          "filter_life_level": {"siid": 27, "piid": 1},
          "filter_left_time": {"siid": 27, "piid": 2},
          "brush_left_time2": {"siid": 28, "piid": 1},
          "brush_life_level2": {"siid": 28, "piid": 2},
          "operating_mode": {"siid": 18, "piid": 1},
          "cleaning_mode": {"siid": 18, "piid": 6},
          "delete_timer": {"siid": 18, "piid": 8},
          "cleaning_time": {"siid": 18, "piid": 2},
          "cleaning_area": {"siid": 18, "piid": 4},
          "first_clean_time": {"siid": 18, "piid": 12},
          "total_clean_time": {"siid": 18, "piid": 13},
          "total_clean_times": {"siid": 18, "piid": 14},
          "total_clean_area": {"siid": 18, "piid": 15},
          "life_sieve": {"siid": 19, "piid": 1},
          "life_brush_side": {"siid": 19, "piid": 2},
          "life_brush_main": {"siid": 19, "piid": 3},
          "timer_enable": {"siid": 20, "piid": 1},
          "start_time": {"siid": 20, "piid": 2},
          "stop_time": {"siid": 20, "piid": 3},
          "deg": {"siid": 21, "piid": 1, "access": ["write"]},
          "speed": {"siid": 21, "piid": 2, "access": ["write"]},
          "map_view": {"siid": 23, "piid": 1},
          "frame_info": {"siid": 23, "piid": 2},
          "volume": {"siid": 24, "piid": 1},
          "voice_package": {"siid": 24, "piid": 3},
          "timezone": {"siid": 25, "piid": 1},
          "home": {"siid": 2, "aiid": 1},
          "locate": {"siid": 17, "aiid": 1},
          "start_clean": {"siid": 3, "aiid": 1},
          "stop_clean": {"siid": 3, "aiid": 2},
          "reset_mainbrush_life": {"siid": 26, "aiid": 1},
          "reset_filter_life": {"siid": 27, "aiid": 1},
          "reset_sidebrush_life": {"siid": 28, "aiid": 1},
          "move": {"siid": 21, "aiid": 1},
          "play_sound": {"siid": 24, "aiid": 3},
          "set_voice": {"siid": 24, "aiid": 2}
        }
      },
      "dreame.vacuum.p2008": {
        "mapping": {
          // https://home.miot-spec.com/spec/dreame.vacuum.p2008
          "battery_level": {"siid": 3, "piid": 1},
          "charging_state": {"siid": 3, "piid": 2},
          "device_fault": {"siid": 2, "piid": 2},
          "device_status": {"siid": 2, "piid": 1},
          "brush_left_time": {"siid": 9, "piid": 1},
          "brush_life_level": {"siid": 9, "piid": 2},
          "filter_life_level": {"siid": 11, "piid": 1},
          "filter_left_time": {"siid": 11, "piid": 2},
          "brush_left_time2": {"siid": 10, "piid": 1},
          "brush_life_level2": {"siid": 10, "piid": 2},
          "operating_mode": {"siid": 4, "piid": 1},
          "cleaning_mode": {"siid": 4, "piid": 4},
          "delete_timer": {"siid": 18, "piid": 8},
          "timer_enable": {"siid": 5, "piid": 1},
          "cleaning_time": {"siid": 4, "piid": 2},
          "cleaning_area": {"siid": 4, "piid": 3},
          "first_clean_time": {"siid": 12, "piid": 1},
          "total_clean_time": {"siid": 12, "piid": 2},
          "total_clean_times": {"siid": 12, "piid": 3},
          "total_clean_area": {"siid": 12, "piid": 4},
          "start_time": {"siid": 5, "piid": 2},
          "stop_time": {"siid": 5, "piid": 3},
          "map_view": {"siid": 6, "piid": 1},
          "frame_info": {"siid": 6, "piid": 2},
          "volume": {"siid": 7, "piid": 1},
          "voice_package": {"siid": 7, "piid": 2},
          "water_flow": {"siid": 4, "piid": 5},
          "water_box_carriage_status": {"siid": 4, "piid": 6},
          "timezone": {"siid": 8, "piid": 1},
          "home": {"siid": 3, "aiid": 1},
          "locate": {"siid": 7, "aiid": 1},
          "start_clean": {"siid": 4, "aiid": 1},
          "stop_clean": {"siid": 4, "aiid": 2},
          "reset_mainbrush_life": {"siid": 9, "aiid": 1},
          "reset_filter_life": {"siid": 11, "aiid": 1},
          "reset_sidebrush_life": {"siid": 10, "aiid": 1},
          "move": {"siid": 21, "aiid": 1},
          "play_sound": {"siid": 7, "aiid": 2}
        }
      },
      "dreame.vacuum.p2009": {
        // https://home.miot-spec.com/spec/dreame.vacuum.p2009
        "mapping": "dreame.vacuum.p2008"
      },
      "dreame.vacuum.p2028": {
        // https://home.miot-spec.com/spec/dreame.vacuum.p2028
        "mapping": "dreame.vacuum.p2008"
      },
      "dreame.vacuum.p2041o": {
        // https://home.miot-spec.com/spec/dreame.vacuum.p2041o
        "mapping": "dreame.vacuum.p2008"
      },
      "dreame.vacuum.p2150a": {
        // https://home.miot-spec.com/spec/dreame.vacuum.p2150a
        "mapping": "dreame.vacuum.p2008"
      }
      ,
      "dreame.vacuum.p2150o": {
        // https://home.miot-spec.com/spec/dreame.vacuum.p2150o
        "mapping": "dreame.vacuum.p2008"
      }
    }
  }

}

module.exports = miotMappings;