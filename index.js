var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var shortid = require('shortid');

var open = [];
var connections = []

app.get('/', function(req, res){
  res.sendFile('index.html', { root: __dirname });
});

io.on('connection', function(socket){
  console.log('user connected');
  
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
