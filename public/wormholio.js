var socket = io();
var connectedTo = null;
var whoops = [
  'a non-Euclidean explosion occurred somewhere in the multiverse',
  'you did something horribly wrong',
  'what were you even trying to do',
  'a portal almost opens, but then doesn\'t'
];

function showError() {
  $('#messages').text(whoops[Math.floor(Math.random() * whoops.length)]);
}

function connect() {
  if (connectedTo === null) {
    if ($('#them').val() === "") {
      $('#messages').text('enter a destination first');
    }
    else {
    socket.emit('establish portal', $('#them').val());
      $('#them').attr('disabled', 'disabled');
      $('#connect').attr('disabled', 'disabled'); 
    }
  }
  else {
    socket.emit('close portal');
    $('#connect').attr('disabled', 'disabled'); 
  }
}

$('form').submit(function() {
  connect();
  return false;
});
socket.on('initialize', function(name) {
  $('#messages').text('enter another code above');
  $('#me').val(name);
  $('h1>strong').text(name);
  $('#them').removeAttr('disabled');
  $('#connect').removeAttr('disabled');
  let val = $('#them').val();
  if (val !== '' && val.length == 7) {
    connect();
  }
  else {
    $('#them').val('');
    $('#them').focus();
  }
});

socket.on('establish portal', function(other) {
  $('#them').val(other);
  $('#them').attr('disabled', 'disabled');
  $('#messages').text('portal open');
  $('#connect').removeAttr('disabled');
  $('#connect').text('close');
  connectedTo = other;
});

socket.on('close portal', function(other) {
  $('#messages').text('portal closed');
  $('#connect').removeAttr('disabled');
  $('#connect').text('open');
  $('#them').val('');
  $('#them').removeAttr('disabled');
  connectedTo = null;
});
socket.on('whoops', function(msg) {
  showError();
  $('#connect').removeAttr('disabled');
  $('#connect').text('open');
  $('#them').val('');
  $('#them').removeAttr('disabled');
  connectedTo = null;
});

socket.on('download', function(file) {
  if (typeof location.origin === 'undefined')
    location.origin = location.protocol + '//' + location.host;
  document.getElementById('downloader').src = location.origin + '/' + file;
});

var dropZone = document.getElementById('drop');

var mouseX = 0;
var mouseY = 0;

var centerX = 0;
var centerY = 0;

$(document).on("mousemove", function(event) {
  mouseX = event.pageX;
  mouseY = event.pageY;
});

// Optional.   Show the copy icon when dragging over.  Seems to only work for chrome.
dropZone.addEventListener('dragover', function(e) {
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});

// Get file data on drop
dropZone.addEventListener('drop', function(e) {
  e.stopPropagation();
  e.preventDefault();
  if (connectedTo) {
    var files = e.target.files || e.dataTransfer.files;
    //for (var i = 0, file; file = files[i]; ++i) {
    var file = files[0];
      var reader = new FileReader();
      reader.onload = function(e2) { // finished reading file data.
        var buffer = e2.target.result;
        if (file.type.match(/image.*/)) {
          var img = $('<img>');
          //img.attr('src', buffer);
          img.attr('src', 'data:image/png;base64,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');
          img.css({ 'left': mouseX + 'px', 'top': mouseY + 'px' });
          $('body').append(img);
          img.addClass('dropped');
          img.animate({'left': centerX + 'px', 'top': centerY + 'px', 'max-height': 0, 'max-width': 0 }, 1500, 'easeOutElastic')
          setTimeout(function () { img.fadeOut(800, function() { $(this).remove(); }); }, 200);
        }
        socket.emit('upload', file.name, buffer); // send the content via socket
      }
      reader.readAsBinaryString(file);
      //reader.readAsDataURL(file);
    //}
  }
  else {
    showError();
  }
});

  
var canvas = document.getElementById('wormhole');
var ctx = canvas.getContext('2d');

var radMin = 40;
var radMax = 200;
var angSpeedMin = 0.0003;
var angSpeedMax = 0.0014;
var distMax = 0;
var distEndMin = 10;
var distEndMax = 30;
var distSpeedMin = 0.007;
var distSpeedMax = 0.012;
var circSpawnMin = 1;
var circSpawnMax = 3;

var colorOffset = 0;
var colorOffsetSpeed = 0.005;

var satMin = 0.25;
var satMax = 0.75;
var lumMin = 0.25;
var lumMax = 0.75;

var globalAlpha = 0;
var globalScale = 0;
var globalRot = -Math.PI * 4;

function findCenter() {
  centerX = Math.floor(window.innerWidth / 2);
  centerY = Math.floor(window.innerWidth / 2);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  distMax = (canvas.width > canvas.height ? canvas.width / 2 : canvas.height / 2) + radMax * Math.PI;
}

$(window).resize(function() {
  findCenter();
});

$(function() {
  findCenter();
});

window.requestAnimationFrame = window.requestAnimationFrame || function(callback){ window.setTimeout(callback, 16) };

whCirc = function(ang, rad) {
  this.ang = ang;
  this.dist = 1;
  this.angSpeed = angSpeedMin + Math.random() * (angSpeedMax - angSpeedMin);// * (1 + Math.sin((+new Date() % 1000) / 1000) * Math.PI * 2);
  this.distSpeed = distSpeedMin + Math.random() * (distSpeedMax - distSpeedMin);
  this.radMax = rad;
  this.rad = rad;
  this.x = 0;
  this.y = 0;
  this.strokeStyle = tinycolor({ h: ((this.ang + colorOffset) % Math.PI * 2) / Math.PI * 180, s: satMin + (satMax - satMin) * Math.random(), l: lumMin + (lumMax - lumMin)   * Math.random() }).toRgbString();
  this.alpha = 0;
  this.fadingIn = true;
}

function easyEase(x, target, speed, snap) {
  if (speed === undefined)
    speed = 0.1;
  var ret = x + (target - x) * speed;
  if (snap === undefined)
    snap = 0.001;
  if (Math.abs(x - target) <= snap)
    ret = target;
  return ret;
}

var whCircs = [];

engine = function() {
  this.frameCount = 0;
  self = this;

  this.update = function() {
  
    colorOffset = (colorOffset + colorOffsetSpeed) % (Math.PI * 2);
    
    //if (true) {
    if (connectedTo != null) {
      for (let i = 0; i < Math.floor(Math.random() * (circSpawnMax - circSpawnMin)) + circSpawnMin; ++i)
        whCircs.push(new whCirc(Math.random() * Math.PI * 2, radMin + Math.random() * (radMax - radMin)));
      globalAlpha = easyEase(globalAlpha, 1, 0.02);
      globalScale = easyEase(globalScale, 1, 0.01);
      globalRot = easyEase(globalRot, 0, 0.045);
    }
    else {
      globalAlpha = easyEase(globalAlpha, 0, 0.01);
      globalScale = easyEase(globalScale, 0, 0.01);
      globalRot = easyEase(globalRot, 0, 0.03);
    }
    
    let i = whCircs.length;
    while (i--) {
      let amt = whCircs[i].dist;
      let amtSq = Math.sqrt(amt * globalScale);
      whCircs[i].dist -= amtSq * whCircs[i].distSpeed;
      whCircs[i].ang -= Math.abs(3.5 - amt) * whCircs[i].angSpeed;
      whCircs[i].rad = amt * whCircs[i].radMax;
      if (whCircs[i].fadingIn) {
        whCircs[i].alpha = easyEase(whCircs[i].alpha, amtSq, 0.04);
        if (whCircs[i].alpha >= 0.99)
          whCircs[i].fadingIn = false;
      }
      else {
        whCircs[i].alpha = amtSq;
      }
      
      if (whCircs[i].dist < 0) {
        whCircs.splice(i, 1);
        continue;
      }
      
      whCircs[i].x = canvas.width / 2 + Math.cos(whCircs[i].ang + globalRot) * whCircs[i].dist * globalScale * distMax;
      whCircs[i].y = canvas.height / 2 + Math.sin(whCircs[i].ang + globalRot) * whCircs[i].dist * globalScale * distMax;
    };
  }

  this.render = function() {
    
    var gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width > canvas.height ? canvas.width / 2 : canvas.height / 2);
    gradient.addColorStop(0, 'rgb(255, 255, 255)');
    gradient.addColorStop(1, 'rgb(200, 200, 200)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    
    for (let i = 0; i < whCircs.length; ++i) {
      ctx.globalAlpha = whCircs[i].alpha * globalAlpha;
      ctx.strokeStyle = whCircs[i].strokeStyle;
      ctx.beginPath();
      ctx.arc(whCircs[i].x, whCircs[i].y, whCircs[i].rad * Math.sqrt(globalScale), 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  this.frame = function() {
    self.update();
    self.render();
    self.frameCount++;
    window.requestAnimationFrame(frame);
  }
  
  this.frame();
};
engine();
