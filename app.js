//Set up ========================================
// Get all the tools we need

var express = require('express');
var port = process.env.PORT || 8080;
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

//configuration =================================

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Routes =========================================
require('./routes/routes.js')(app);//Load our routes and pass in our app  and fully configured passport


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



app.listen(port, function(){
    console.log('The magic happens on port ', port);
});

//module.exports = app;



//Socket.io =================================

var io = require('socket.io').listen(app);

var chanels = {};

io.sockets.on('connection', function(socket){
    var initiatorChannel = '';
    if(!io.isConnected)
        io.isConnected = true;
    
    socket.on('new-chanel', function(data){
        if(!chanels[data.chanel]){
            initiatorChannel = data.chanel;
            console.log('**** initiatorChannel', initiatorChannel);
        }
        
        chanels[data.chanel] = data.chanel;
        onNewNamespace(data.channel, data.sender);
    });
    
    socket.on('presence', function (channel) {
        console.log('_____socket.on(presence)');
        var isChannelPresent = !! channels[channel];
        socket.emit('presence', isChannelPresent);
    });

    socket.on('disconnect', function (channel) {
        console.log('_____socket.on(disconnected)');
        if (initiatorChannel) {
            console.log('_____initialtorChannel: ', initiatorChannel);
            delete channels[initiatorChannel];
            console.log('______channels: ', channels);
        }
    });
});

function onNewNamespace(channel, sender) {
    io.of('/' + channel).on('connection', function (socket) {
        if (io.isConnected) {
            console.log('io.isConnected', io.isConnected);
            io.isConnected = false;
            socket.emit('connect', true);
        }

        socket.on('message', function (data) {
            if (data.sender === sender)
                socket.broadcast.emit('message', data.data);
        });
    });
}