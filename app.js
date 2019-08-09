'use strict';

const {Game, RealPlayer, BotPlayer, SimpleBotStrategy} = require('./criss-cross');

(async () => {
  await new Game().play(
    new RealPlayer('x'),
    new BotPlayer('o', new SimpleBotStrategy())
  );
})();
