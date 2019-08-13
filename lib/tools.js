class EventBinder {
  bind(source, target) {
    Object.getOwnPropertyNames(source.__proto__)
      .filter(m => m !== 'constructor' && !m.startsWith('_'))
      .forEach(method => {
        target.on(method, (...args) => source[method].apply(source, args));
      });
  }
}

class ConsoleGameRenderer {
  render(game) {
    return game.values
      .map(row => row.map(value => !value ? ' ' : value).join(' | '))
      .join('\n');
  }
}

module.exports = {EventBinder, ConsoleGameRenderer};
