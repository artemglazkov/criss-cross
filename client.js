'use strict';

const socket = require('socket.io-client')('http://localhost:3000');
const {ConsoleGameRenderer} = require('./lib/tools');

socket.on('connect', function () {
  socket.emit('join', (mark, status) => {
    console.log(`Connect to the game`);
    console.log(new ConsoleGameRenderer().render(status));
    console.log(`Play with ${mark}`);
  });
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

console.log('Waiting for the game...');
process.stdin.on('data', bytes => {
  const [x, y] = bytes.toString().trim().split(' ');
  if (x && y)
    socket.emit('put', {x: x, y: y, mark: 'x'});
});
