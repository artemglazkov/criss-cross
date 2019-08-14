'use strict';

const uuid = require('uuid');
const {ConsoleGameRenderer} = require('./tools');

class User {
  constructor(name) {
    this.id = uuid.v4();
    this.name = name;
  }
}

class Player {
  mark;
  user;

  constructor(mark) {
    this.mark = mark;
  }

  get isRegistered() {
    return Boolean(this.user);
  }

  register(user) {
    this.user = user;
  }

  get name() {
    return this.isRegistered ? this.user.name : '';
  }

  async play(game) {
    throw new Error(`Inherit and implement how to play with '${this.mark}'`);
  }
}

class Game {
  constructor(size = 3) {
    this.id = uuid.v4();
    this.players = [new Player('x'), new Player('o')];
    this.turns = 0;
    this.hasWinner = false;
    this.size = size;
    this.values = [];
    for (let i = 0; i < size; i++) {
      this.values.push([]);
      for (let j = 0; j < size; j++)
        this.values[i][j] = null;
    }
  }

  get currentPlayer() {
    return this.players.length > 0 ? this.players[this.turns % this.players.length] : null;
  }

  register(user) {
    const player = this.players.find(player => !player.isRegistered);
    if (player)
      player.register(user);
    return player;
  }

  get isOver() {
    return this.hasWinner || this.turns > Math.pow(this.size, 2) - 1;
  }

  toString() {
    return new ConsoleGameRenderer().render(this);
  }

  async play(...players) {
    console.log('Lets play Criss Cross game');
    console.log(this.toString());
    let player;
    while (!this.isOver) {
      player = players[this.turns % 2];
      console.log(`${player.name}\'s turn with '${player.mark}':`);
      await player.play(this);
      console.log(this.toString());
    }
    if (this.hasWinner)
      console.log(`!!! ${player.name} wins !!!`);
    console.log('GAME OVER');
    process.exit();
  }

  checkWinAt(x, y, mark) {
    const winRow = this.values[x].reduce((r, v) => (r && v === mark), true);
    const winCol = this.values.reduce((r, row) => (r && row[y] === mark), true);

    let [winDiag1, winDiag2] = [true, true];
    for (let i = 0; i < this.size; i++) {
      winDiag1 &= this.values[i][i] === mark;
      winDiag2 &= this.values[this.size - 1 - i][this.size - 1 - i] === mark;
    }

    return winRow || winCol || winDiag1 || winDiag2;
  }

  put(x, y, player) {
    if (player.id !== this.currentPlayer.id)
      throw new Error('Wrong player order');

    const isValid = (x) => x >= 0 && x < this.size;
    if (!isValid(x) || !isValid(y))
      throw new Error(`Cell [${x},${y}] is out of range`);

    if (this.values[x][y])
      throw new Error(`Cell [${x},${y}] is already busy`);

    this.values[x][y] = player.mark;
    this.turns++;
    this.hasWinner = this.checkWinAt(x, y, player.mark);
  }
}

class RealPlayer extends Player {
  constructor(mark) {
    super('Real player', mark);
  }

  async play(game) {
    return new Promise((resolve) => {
      process.stdin.resume();
      process.stdin.once('data', bytes => {
        process.stdin.pause();
        const [x, y] = bytes.toString().trim().split(' ');
        if (x && y) {
          game.put(x, y, this.mark);
          resolve();
        }
      });
    });
  }
}

class BotPlayer extends Player {
  constructor(mark, strategy) {
    super('Bot player', mark);
    this.strategy = strategy;
  }

  async play(game) {
    const [x, y] = this.strategy.findNext(game);
    game.put(x, y, this.mark);
  }
}

class SimpleBotStrategy {
  findNext(game) {
    const values = game.values;
    for (let i = 0; i < values.length; i++)
      for (let j = 0; j < values[i].length; j++)
        if (!values[i][j])
          return [i, j];
  }
}

module.exports = {User, Game, Player, RealPlayer, BotPlayer, SimpleBotStrategy};
