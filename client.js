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

socket.on('statusError', function (err) {
  console.error(err.message);
});

socket.on('disconnect', function () {
  console.log('disconnect');
});

process.stdin.on('data', bytes => {
  const [x, y] = bytes.toString().trim().split(' ');
  if (x && y)
    socket.emit('put', {x: x, y: y, mark: 'x'});
});
