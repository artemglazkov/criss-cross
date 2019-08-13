'use strict';

const socket = require('socket.io-client')('http://localhost:3000');

socket.on('connect', function () {
  console.log('connect');
});

socket.on('status', function (status) {
  console.log('The game');
  console.log(status);
});

socket.on('disconnect', function () {
  console.log('disconnect');
});

process.stdin.on('data', bytes => {
  const [x, y] = bytes.toString().trim().split(' ');
  if (x && y) {
    console.log('Emit', {x: x, y: y, mark: 'x'});
    socket.emit('put', {x: x, y: y, mark: 'x'});
  }
});