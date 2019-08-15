'use strict';

const socket = require('socket.io-client')('http://localhost:3000');
const {ConsoleGameRenderer} = require('./lib/tools');

let playerId;

function joined(player, game) {
  playerId = player.id;
  console.log(`Joined to the game ${game.id}`);
  console.log(new ConsoleGameRenderer().render(game));
  console.log(`Play with ${player.mark}`);
}

socket.on('connect', () => {
  socket.emit('join', joined);
});

socket.on('join', () => {
  socket.emit('join', joined);
});

socket.on('status', (status) => {
  console.log('The game');
  console.log(new ConsoleGameRenderer().render(status));
});

socket.on('statusError', (err) => {
  console.error(err.message);
});

socket.on('message', (message) => {
  console.log(message);
});

socket.on('disconnect', () => {
  console.log('disconnect');
});

console.log('Waiting for the game...');
process.stdin.on('data', bytes => {
  const command = bytes.toString().trim();
  if (command.startsWith('/')) {
    if (command.match(/^\/start/i)) {
      socket.emit('start', joined);
    }
  } else {
    const [x, y] = command.split(' ');
    if (x && y)
      socket.emit('put', {playerId: playerId, x: x, y: y, mark: 'x'});
  }
});
