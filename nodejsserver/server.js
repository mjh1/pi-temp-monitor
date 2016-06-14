var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var sensorLib = require('node-dht-sensor');

app.set('view engine', 'ejs');
app.set('view options', { layout: false });
app.use('/public', express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var sensor = {
    initialize: function () {
        return sensorLib.initialize(11, 23);
    },
    read: function () {
        var readout = sensorLib.read();
        console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' +
            'humidity: ' + readout.humidity.toFixed(2) + '%');
        return {temp: readout.temperature.toFixed(2), humidity: readout.humidity.toFixed(2)};
    }
};

app.get('/currenttemp', function (req, res) {
    if (sensor.initialize()) {
        readings = sensor.read();
    } else {
        console.warn('Failed to initialize sensor');
    }
    res.render('currenttemp', {
        temp: readings.temp,
        humidity: readings.humidity
    });
});

app.listen(process.env.PORT || 4000);
console.log("Listening on port: " + (process.env.PORT || 4000));
