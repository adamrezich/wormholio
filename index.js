'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var shortid = require('shortid');
var fs = require('fs'); 
var mkdirp = require('mkdirp');
var serveStatic = require('serve-static');
var fileExists = require('file-exists');
var pug = require('pug');

app.set('port', (process.env.PORT || 80));
app.set('view engine', 'pug');

var users = {};

var dir = 'uploaded';

mkdirp(__dirname + '/' + dir);


app.get('/', function(req, res) {
  res.render('index', { code: '' });
});

app.get('/:code', function(req, res) {
  res.render('index', { code: req.params.code });
});


app.use('/public', serveStatic(__dirname + '/public'));

app.get('/' + dir + '/*', function(req, res) {
  let file = __dirname + decodeURI(req.url);
  
  if (fileExists(file)) {

    res.download(file, decodeURI(req.params[0]), function(err) {
      if (!err) {
        fs.unlink(file);
      }
      else {
        console.log(err);
      }
    });
  }
  else
    res.status(404).send();
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
      socket.emit('whoops', 'lol nice try idiot');
    }
    else if (users[other] !== undefined && users[other].connectedTo === null) {
      users[other].connectedTo = name;
      users[name].connectedTo = other;
      socket.emit('establish portal', other);
      io.sockets.connected[users[other].socket].emit('establish portal', name);
    }
    else {
      socket.emit('whoops');
      console.log('ehh');
      console.log(users);
      console.log(other);
      console.log(users[other]);
      console.log(users[other].connectedTo);
    }
  });
  
  socket.on('close portal', function() {
    let connectedTo = users[name].connectedTo;
    if (connectedTo === null) {
      socket.emit('whoops', 'lol nice try idiot');
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
  
  socket.on('upload', function(filename, buffer) {
    let connectedTo = users[name].connectedTo;
    let fullFilename = __dirname + '/' + dir + '/' + filename;
    
    if (connectedTo !== null) {
      fs.open(fullFilename, 'a', 777, function(err, fd) {
        if (err) throw err;
        fs.write(fd, buffer, null, 'Binary', function(err, written, buff) {
          fs.close(fd, function() {
            console.log('uploaded ' + filename);
            io.sockets.connected[users[connectedTo].socket].emit('download', dir + '/' + filename);
          })
        })
      });
    }
    else {
      fs.unlink(fullFilename);
      socket.emit('whoops');
    }
  });
});

http.listen(app.get('port'), function() {
  console.log('listening on *:' + app.get('port'));
});
