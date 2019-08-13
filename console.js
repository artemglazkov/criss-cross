class ConsoleGameRenderer {
  render(game) {
    return game.values
      .map(row => row.map(value => !value ? ' ' : value).join(' | '))
      .join('\n');
  }
}

module.exports = {ConsoleGameRenderer};
