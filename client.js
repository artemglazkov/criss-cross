'use strict';

const socket = require('socket.io-client')('http://localhost:3000');
const {ConsoleGameRenderer} = require('./lib/tools');

let playerId;

function joined(player, game) {
  playerId = player.id;
  console.log();
  console.log(`You have joined to the game as ${player.name}`);
  console.log();
  console.log(`Enter coordinates separated by space. For example:`);
  console.log(`For example:`);
  console.log(`  1 1   - to put '${player.mark}' to the center`);
  console.log(`  0 2   - to put '${player.mark}' to the right top corner`);
  console.log();
  console.log('The game');
  console.log(new ConsoleGameRenderer().render(game));
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

socket.on('putError', (err) => {
  console.error(err.message);
});

socket.on('message', (message) => {
  console.log(message);
});

socket.on('disconnect', () => {
  console.log('disconnect');
});

console.log('Enter a command');
console.log('  /start      - play with another player');
console.log('  /start bot  - play with a bot');
console.log();
process.stdin.on('data', bytes => {
  const command = bytes.toString().trim();
  if (command.startsWith('/')) {
    if (command.match(/^\/start/i)) {
      socket.emit('start', {bot: Boolean(command.match(/\s+bot\s*/i))}, joined);
    }
  } else {
    const [x, y] = command.split(' ');
    if (x && y)
      socket.emit('put', {playerId: playerId, x: x, y: y, mark: 'x'});
  }
});
