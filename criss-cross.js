'use strict';

class Game {
  constructor() {
    this.turns = 0;
    this.hasWinner = false;
    this.values = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]
  }

  get isOver() {
    return this.hasWinner || this.turns > 8;
  }

  async play(...players) {
    console.log('Lets play Criss Cross game');
    this.draw();
    let player;
    while (!this.isOver) {
      player = players[this.turns % 2];
      console.log(`${player.name}\'s turn with '${player.mark}':`);
      await player.play(this);
    }
    if (this.hasWinner)
      console.log(`!!! ${player.name} wins !!!`);
    console.log('GAME OVER');
    process.exit();
  }

  draw() {
    const theGame = this.values
      .map(row => row.map(value => !value ? ' ' : value).join(' | '))
      .join('\n');
    console.log(theGame);
  }

  checkWinAt(x, y, mark) {
    const winRow = this.values[x].reduce((r, v) => (r && v === mark), true);
    const winCol = this.values.reduce((r, row) => (r && row[y] === mark), true);

    let [winDiag1, winDiag2] = [true, true];
    for (let i = 0; i < this.values.length; i++) {
      winDiag1 &= this.values[i][i] === mark;
      winDiag2 &= this.values[this.values.length - 1 - i][this.values.length - 1 - i] === mark;
    }

    return winRow || winCol || winDiag1 || winDiag2;
  }

  put(x, y, mark) {
    const isValid = (x) => x >= 0 && x <= 3;
    if (!isValid(x) || !isValid(y))
      return console.log(`Out of range ${x}, ${y}`);
    if (this.values[x][y])
      return console.log(`You cannot put '${mark}' at ${x}, ${y}`);

    this.values[x][y] = mark;
    this.turns++;
    this.hasWinner = this.checkWinAt(x, y, mark);
    this.draw();
  }
}

class Player {
  constructor(name, mark) {
    this.name = name;
    this.mark = mark;
  }

  async play(game) {
    throw new Error(`Inherit and implement how to play with '${this.mark}'`);
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

module.exports = {Game, Player, RealPlayer, BotPlayer, SimpleBotStrategy};
