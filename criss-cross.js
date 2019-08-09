'use strict';

class Game {
  constructor() {
    this.turns = 0;
    this.values = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]
  }

  get isOver() {
    return this.turns > 8;
  }

  async play(...players) {
    console.log('Lets play Criss Cross game');
    this.draw();
    while (!this.isOver) {
      let player = players[this.turns % 2];
      console.log(`${player.name}\'s turn with '${player.mark}':`);
      await player.play(this);
    }
    console.log('GAME OVER');
    process.exit();
  }

  draw() {
    const theGame = this.values
      .map(row => row.map(value => !value ? ' ' : value).join(' | '))
      .join('\n');
    console.log(theGame);
  }

  put(x, y, mark) {
    const isValid = (x) => x >= 0 && x <= 3;
    if (!isValid(x) || !isValid(y))
      return console.log(`Out of range ${x}, ${y}`);
    if (this.values[x][y])
      return console.log(`You cannot put '${mark}' at ${x}, ${y}`);

    this.values[x][y] = mark;
    this.turns++;
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
