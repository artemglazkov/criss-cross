/**
 * Subscribes class methods to EventEmitter.
 */
class EventBinder {
  /**
   * Binds source class methods to events of target EventEmitter with the same names.
   * Except 'constructor' and private methods started with '_'.
   * @param source - Source class to subscribe.
   * @param target - EventEmitter to be subscribed.
   */
  bind(source, target) {
    Object.getOwnPropertyNames(source.__proto__)
      .filter(m => m !== 'constructor' && !m.startsWith('_'))
      .forEach(method => {
        target.on(method, (...args) => source[method].apply(source, args));
      });
  }
}

/**
 * Renders Criss Cross game in ASCII graphic.
 */
class ConsoleGameRenderer {
  /**
   * Renders game in ASCII graphic.
   * @param {Game} game - Game to render.
   * @return {string}   - Result string.
   * @example
   *  x |   | o
   *  o | x | x
   *  x |   | o
   */
  render(game) {
    return game.values
      .map(row => row.map(value => !value ? ' ' : value).join(' | '))
      .join('\n');
  }
}

module.exports = {EventBinder, ConsoleGameRenderer};
