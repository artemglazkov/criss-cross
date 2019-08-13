'use strict';

const socket = require('socket.io-client')('http://localhost:3000');
const {ConsoleGameRenderer} = require('./lib/tools');

socket.on('connect', function () {
  console.log('connect');
});

socket.on('status', function (status) {
  console.log('The game');
  console.log(new ConsoleGameRenderer().render(status));
});

socket.on('disconnect', function () {
  console.log('disconnect');
});

process.stdin.on('data', bytes => {
  const [x, y] = bytes.toString().trim().split(' ');
  if (x && y) {
    console.log('Emit put', {x: x, y: y, mark: 'x'});
    socket.emit('put', {x: x, y: y, mark: 'x'});
  }
});
