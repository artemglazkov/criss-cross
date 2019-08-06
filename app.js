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
    this.botMark = 'O';
    this.values = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]
  }

  draw() {
    console.log('\nThe game');
    for (let vector of this.values)
      console.log(vector.map(value => !value ? ' ' : value).join('|'))
  }

  play(x, y, mark) {
    if (x < 0 || y < 0 || x > 3 || y > 3)
      return console.log(`Out of range ${x}, ${y}`);

    if (this.values[x][y])
      return console.log(`You cannot put ${mark} at ${x}, ${y}`);

    this.values[x][y] = mark;
    this.draw();
  }

  playBot() {
    for (let vector of this.values) {
      for (let i = 0; i < vector.length; i++) {
        if (!vector[i]) {

          vector[i] = this.botMark;
          this.draw();
          return;
        }
      }
    }
  }
}

let game = new Game();
game.draw();

game.play(0, 0, 'x');
game.play(0, 0, 'x');
game.play(3, -1, 'x');
game.playBot();
game.play(1, 1, 'x');
game.playBot();

process.stdin.on('data', inputStdin => {
  const input = inputStdin.toString();
  const [x, y, mark] = input.split(' ');
  game.play(x, y, mark);
  game.playBot();
});
