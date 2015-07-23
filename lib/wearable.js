var events    = require('events'),
    cmd       = require('./commands'),
    util      = require('util'),
    _         = require('underscore'),
    helpers   = require('./helpers'),
    bluetooth = require('bluetooth-serial-port'),
    serial    = new bluetooth.BluetoothSerialPort();

/**
 * Creates an instance of the Wearable object.
 * @class
 * @param config {object} - OPTIONAL configuration object.
 * @param config.name {string} - OPTIONAL (default is wearable) name of the wearable to connect.
 * @extends EventEmitter
 * @fires connected - will be emitted when connect to a wearable.
 * @fires disconnected - will be emitted if the wearable disconnect.
 * @fires error - will be emitted if any error occur.
 * @example
 * ```js
 * var Wearable = require('kit-iot-wearable'),
 *     kit = new Wearable();
 *
 * //or pass a object with a param name to specify a wearable name
 * var Wearable = require('kit-iot-wearable'),
 *     kit = new Wearable({
 *       name: 'name-of-your-wearable'
 *     });
 * ```
 */
var Wearable = function (config) {
  'use strict';

  //If is not instance of Wearable return a new instance
  if (false === (this instanceof Wearable)) {
    return new Wearable(config);
  }

  events.EventEmitter.call(this);

  this.defaults = {
    logDeviceInfo: false
  };

  _.extend(this.defaults, config);

  if (!this.defaults.name) {
    throw Error('You need to choose the name of the Wearable you want to connect. EX: var kit = new Wearable({ name: "nameOfYOurWearable" })');
  }

  this.name = this.defaults.name;
  this.devices = [];
  this.data = {
    temperature: null,
    luminosity: null,
    button1: false,
    button2: false,
    accelerometer: {
      x: null,
      y: null,
      z: null
    }
  };

  return this;
};


/**
 * Nodejs EventEmitter.
 * @external EventEmitter
 * @see {@link http://nodejs.org/api/events.html#events_class_events_eventemitter}
 */
/**
 * Connected event will be fired when connect to a wearable.
 * @event connected
 * @example
 * ```js
 * ...
 *
 * kit.on('connected', function () {
 *   console.log('Wearable is Conected!');
 * });
 * ```
 */
/**
 * Error event will be fired when any error occur.
 * @event error
 * @type {string}
 * @example
 * ```js
 * ...
 *
 * kit.on('error', function (err) {
 *   console.log(err);
 * });
 * ```
 */
/**
 * Disconnected event will be fired when disconnect form a wearable.
 * @event disconnected
 * @example
 * ```js
 * ...
 *
 * kit.on('disconnected', function () {
 *   console.log('Disconnected from wearable');
 * });
 * ```
 */
util.inherits(Wearable, events.EventEmitter);


/**
 * Look for the wearable kit.
 * @example
 * ```js
 * ...
 *
 * //Start looking for the wearable
 * kit.findWearable();
 * ```
 */
Wearable.prototype.findWearable = function () {
  var _this = this,
      regex = new RegExp(_this.name, 'i');

  this.disconnect();

  serial.on('found', function (address, name) {
    var device = {
      address: address,
      name   : name
    };

    if (regex.test(device.name)) {
      if (_this.defaults.logDeviceInfo) {
        helpers.log('Info: ' + device.name, true);
        helpers.log(device);
      }

      _this.devices.push(device);

      helpers.log('Try to connect to "'+ device.name + '"', true);
      _this.connect(device);
    }
  });

  //When finish looking for a device
  serial.on('finished', function () {
    helpers.log('finished');

    if (_this.devices) {
      _this.emit('found');

    } else {
      _this.emit('error', 'Could not find the device "'+ _this.name +'"');
    }
  });

  //On close disconnect
  serial.on('close', function () {
    _this.disconnect();
  });

  //When receive data
  serial.on('data', function (data) {
    _this.onData(data);
  });

  //On any failure
  serial.on('failure', function (err) {
    _this.emit('error', err);
  });

  //start the search for the wearables
  helpers.log('Searching for device "'+ this.name +'"', true);
  serial.inquire();

  return this;
};


/**
 * Connect to a wearable kit. This method is executed during
 * the findWearable method.
 * @param device {object} - object with device information.
 * @param device.address {string} - address of the wearable.
 * @param device.name {string} - name of the wearable.
 * @fires connected - will be emitted when connect to a wearable.
 * @example
 * ```js
 * ...
 *
 * kit.connect({
 *   name   : 'wearable',
 *   address: '30-14-08-26-24-39'
 * });
 *
 * //after connect the 'connected' event will be emitted
 * kit.on('connected', function () {
 *   kit.ledON('RED');
 *   kit.playMelody();
 * });
 * ```
 */
Wearable.prototype.connect = function (device) {
  var _this  = this;

  if (device) {
    //Connect to the wearable
    serial.connect(device.address, 1, function successConnect() {
      _this.emit('connected');

    }, function errorConnect(err) {
      _this.emit('error', err);
    });
  }

  return this;
};


/**
 * Disconnect the wearable kit.
 * @fires disconnected - will be emitted if the wearable disconnect.
 * @example
 *
 * ```js
 * ...
 *
 * kit.on('connected', function () {
 *   kit.disconnect();
 * });
 *
 * //after disconnect the 'disconnected' event will be emitted
 * kit.on('disconnected', function () {
 *   console.log('Disconnected from wearable');
 * });
 * ```
 */
Wearable.prototype.disconnect = function () {
  this.emit('disconnected');
  serial.close();

  return this;
};


/**
 * Send command to the wearable.
 * @param command {string} - command to send to the wearable.
 * @example
 * ```js
 * ...
 *
 * kit.on('connected', function () {
 *   //send the command to read the luminosity sensor
 *   kit.sendCommand('#LI0000');
 * });
 * ```
 */
Wearable.prototype.sendCommand = function (command) {
  var _this = this;

  //Send the commad as buffer, the commadn should end with a "\n"
  serial.write(new Buffer(command + '\n', 'utf8'), function (err) {
    if (err) {
      _this.emit('error', err);
    }
  });

  return this;
};


/**
 * On data receive from wearable.
 * @param data {string} - string received from the wearable.
 * @ignore
 */
Wearable.prototype.onData = function (data) {
  var buf = new Buffer(data),
      str = buf.toString('utf-8').trim();

  if (/#B1/.test(str)) {
    var b1  = str.replace(/#B1/, ''),
        val = !!parseFloat(b1);

    this.data.button1 = val;
    this.emit('data:button1', val);
  }

  if (/#B2/.test(str)) {
    var b2  = str.replace(/#B2/, ''),
        val = !!parseFloat(b2);

    this.data.button2 = val;
    this.emit('data:button2', val);
  }

  if (/#TE/.test(str)) {
    var te  = str.trim().replace(/#TE/, ''),
        val = parseFloat(te);

    console.log(str);
    console.log(val);
    this.data.temperature = val;
    this.emit('data:temperature', val);
  }

  if (/#LI/.test(str)) {
    var li  = str.replace(/#LI/, ''),
        val = parseFloat(li.trim());

    this.data.luminosity = val;
    this.emit('data:luminosity', val);
  }


  if (/#A/.test(str)) {
    var axis   = str[2],
        regex  = new RegExp('#A' + axis.toUpperCase()),
        ac     = str.replace(regex, ''),
        parsed = parseFloat(ac.trim());

    this.data.accelerometer[axis.toLowerCase()] = parsed;
    this.emit('data:accelerometer-' + axis.toLowerCase(), parsed);
    this.emit('data:accelerometer');
  }

  this.emit('data', str);

  return this;
};


/**
 * Trun off LED.
 * @example
 * ```js
 * ...
 *
 * kit.on('connected', function () {
 *   kit.ledOFF();
 * });
 * ```
 */
Wearable.prototype.ledOFF = function () {
  this.sendCommand(cmd.LED.RED.LOW);
  this.sendCommand(cmd.LED.GREEN.LOW);
  this.sendCommand(cmd.LED.BLUE.LOW);

  return this;
};


/**
 * Trun on LED.
 * @param color {string} - OPTIONAL (default is GREEN) color of the led to turn on
 * @param value {number} - OPTIONAL value of the intensity for the led (0 to 255)
 * @example
 * ```js
 * ...
 *
 * kit.on('connected', function () {
 *   kit.ledON(); //turn on the GREEN led by default
 *   kit.ledON('GREEN'); //turn on the GREEN led
 *   kit.ledON('RED'); //turn on the RED led
 *   kit.ledON('BLUE'); //turn on the BLUE led
 * });
 * ```
 */
Wearable.prototype.ledON = function (color, value) {
  var colors = ['RED', 'GREEN', 'BLUE'],
      rgb = (color) ? color.toUpperCase() : 'GREEN',
      command;

  if (colors.indexOf(rgb) !== -1) {
    command = (value) ? cmd.LED[rgb].CUSTOM(value) : cmd.LED[rgb].HIGH;

  } else {
    command = (value) ? cmd.LED.GREEN.CUSTOM(value) : cmd.LED.GREEN.HIGH;
  }

  this.ledOFF();
  this.sendCommand(command);

  return this;
};


/**
 * Play music.
 * @param music {string} - OPTIONAL (default is MARIO)
 * @example
 * ```js
 * ...
 *
 * kit.on('connected', function () {
 *   kit.playMelody(); //play the MARIO music
 *   kit.playMelody('CHRISTMAS'); //play the CHRISTMAS music
 * });
 * ```
 */
Wearable.prototype.playMelody = function (music) {
  var musics = ['CHRISTMAS', 'MARIO', 'IMPERIAL'],
      chosen = (musics.indexOf(music) !== -1) ? music : musics[1];

  this.sendCommand(cmd.MUSIC[chosen].toUpperCase());

  return this;
};


/**
 * Get luminosity value.
 * @example
 * ```js
 * ...
 *
 * kit.on('connected', function () {
 *   kit.luminosity();
 *
 *   //On luminosity data
 *   kit.on('data:luminosity', function (data) {
 *     console.log(data);
 *   });
 * });
 * ```
 */
Wearable.prototype.luminosity = function () {
  this.sendCommand(cmd.LUMINOSITY);

  return this;
};


/**
 * Get temperature value.
 * @example
 * ```js
 * ...
 *
 * kit.on('connected', function () {
 *   kit.temperature();
 *
 *   //On temperature data
 *   kit.on('data:temperature', function (data) {
 *     console.log(data);
 *   });
 * });
 * ```
 */
Wearable.prototype.temperature = function () {
  this.sendCommand(cmd.TEMPERATURE);

  return this;
};


/**
 * Get accelerometer value.
 * @param axis {string} - OPTIONAL (default is x,y,z)
 * @example
 * ```js
 * ...
 * kit.on('connected', function () {
 *   kit.accelerometer();
 * });
 *
 * //On accelerometer data
 * kit.on('data:accelerometer', function () {
 *  console.log(kit.data.accelerometer);
 * });
 *
 * //On accelerometer X data
 * kit.on('data:accelerometer-x', function (data) {
 *  console.log(data);
 * });
 *
 * //On accelerometer Y data
 * kit.on('data:accelerometer-y', function (data) {
 *  console.log(data);
 * });
 *
 * //On accelerometer Z data
 * kit.on('data:accelerometer-z', function (data) {
 *  console.log(data);
 * });

 * ```
 */
Wearable.prototype.accelerometer = function (axis) {
  var ax = (axis) ? axis.toLowerCase() : null;

  switch(ax) {
    case 'x':
      this.sendCommand(cmd.ACCELEROMETER.X);
      break;

    case 'y':
      this.sendCommand(cmd.ACCELEROMETER.Y);
      break;

    case 'z':
      this.sendCommand(cmd.ACCELEROMETER.Z);
      break;

    default:
      this.sendCommand(cmd.ACCELEROMETER.XYZ);
      break;
  }

  return this;
};


/**
 * Check if have any wearable connected.
 * @returns {boolean}
 * @example
 * ```js
 * ...
 *
 * kit.on('connected', function () {
 *   console.log(kit.isConnected());
 * });
 * ```
 */
Wearable.prototype.isConnected = function () {
  return serial.isOpen();
};


module.exports = Wearable;

