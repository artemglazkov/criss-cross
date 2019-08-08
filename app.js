'use strict';

/**
 X| |
 | |O
 | |

 * поле 3 на 3, ввод координат через пробелы
 * первый ход делает человек крестиком
 * ввод координат выглядит как-то так: "your move > 1 2"
 * затем автоматом ходит компьютер ноликом
 * есть всего полчаса, нормально, если сделаешь не все, нужно успеть сделать по-максимуму
 * можно гуглить
 /**/

class Game {
  constructor() {
    this.over = false;
    this.values = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]
  }

  async play(...players) {
    console.log('Lets play the Cris-Cross game');
    this.draw();
    while (!this.over) {
      for (let player of players) {
        console.log(`${player.name}\'s turn with '${player.mark}':`);
        await player.play(this);
      }
    }
  }

  draw() {
    const theGame = this.values
      .map(row => row.map(value => !value ? ' ' : value).join(' | '))
      .join('\n');
    console.log(theGame);
  }

  put(x, y, mark) {
    const isValid = (x) => x > 0 && x <= 3;
    if (!isValid(x) || !isValid(y))
      return console.log(`Out of range ${x}, ${y}`);
    if (this.values[x][y])
      return console.log(`You cannot put ${mark} at ${x}, ${y}`);

    this.values[x][y] = mark;
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
  constructor(mark) {
    super('Bot player', mark);
  }

  async play(game) {
    const values = game.values;
    for (let i = 0; i < values.length; i++)
      for (let j = 0; j < values[i].length; j++)
        if (!values[i][j])
          return game.put(i, j, this.mark);
  }
}

(async () => {
  await new Game().play(new RealPlayer('x'), new BotPlayer('o'));
})();