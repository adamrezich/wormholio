"use strict";

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var shortid = require('shortid');

var users = {};

app.get('/', function(req, res) {
  res.sendFile('index.html', { root: __dirname });
});

io.on('connection', function(socket) {
  var name = shortid.generate();
  users[name] = { connectedTo: null, socket: socket.id };
  socket.emit('initialize', name);
  
  console.log('user connected: ' + name);
  
  socket.on('disconnect', function() {
    console.log('user disconnected: ' + name);
    let connectedTo = users[name].connectedTo;
    if (connectedTo !== null) {
      io.sockets.connected[users[connectedTo].socket].emit('close portal', name);
      users[connectedTo].connectedTo = null;
    }
    delete users[name];
  });
  
  socket.on('establish portal', function(other) {
    if (other == name) {
      socket.emit('whoops', 'lol nice try idiot (establish)');
    }
    else if (users[other] !== undefined && users[other].connectedTo === null) {
      users[other].connectedTo = name;
      users[name].connectedTo = other;
      socket.emit('establish portal', other);
      io.sockets.connected[users[other].socket].emit('establish portal', name);
    }
    else {
      socket.emit('whoops');
    }
  });
  
  socket.on('close portal', function() {
    let connectedTo = users[name].connectedTo;
    console.log('>> ' + connectedTo);
    if (connectedTo === null) {
      socket.emit('whoops', 'lol nice try idiot (close)');
    }
    else if (users[connectedTo] !== undefined) {
      io.sockets.connected[users[connectedTo].socket].emit('close portal', name);
      socket.emit('close portal', connectedTo);
      users[connectedTo].connectedTo = null;
      users[name].connectedTo = null;
    }
    else {
      socket.emit('whoops');
    }
  });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
