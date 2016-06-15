var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var sensorLib = require('node-dht-sensor');
var nodemailer = require('nodemailer');

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
        //console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' +
            //'humidity: ' + readout.humidity.toFixed(2) + '%');
        return {temp: readout.temperature.toFixed(2), humidity: readout.humidity.toFixed(2)};
    }
};

if (!sensor.initialize()) {
    console.warn('Failed to initialize sensor');
    process.exit(1);
}

app.get('/currenttemp', function (req, res) {
    readings = sensor.read();
    res.render('currenttemp', {
        temp: readings.temp,
        humidity: readings.humidity
    });
});

var transporter = nodemailer.createTransport(process.env.PITEMP_CONNECTION_STRING);
setInterval(function() {
readings = sensor.read();
if (readings.temp > 26) {
console.log('try to send mail');
var mailOptions = {
    from: '"The pi" <' + process.env.PITEMP_FROM_EMAIL + '>', // sender address
    to: process.env.PITEMP_TO_EMAIL, // list of receivers
    subject: 'help, too hot', // Subject line
    text: readings.temp + 'C', // plaintext body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
}
}, 300000);

app.listen(process.env.PORT || 4000);
console.log("Listening on port: " + (process.env.PORT || 4000));
