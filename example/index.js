var Wearable = require('../lib/wearable'),
    kit = new Wearable({
      name: 'wV3_0E003981'
    });

// Find for the kit
kit.findWearable();

// After kit connected
kit.on('connected', function () {
  console.log("Connected to the kit");
  kit.ledON();

  setInterval(function () {
    kit.accelerometer();
    kit.temperature();
  }, 200);
});

// On bluetooth disconnect
kit.on('disconnected', function () {
  console.log('Disconnected form the wearable!');
});

// Return the 3 axis of the accelerometer ex: { x: 10, y: 5, z -10 }
kit.on('data:accelerometer', function () {
  console.log(kit.data.accelerometer);
});

kit.on('data:temperature', function (data) {
  console.log('temperature is %s', data);
});
