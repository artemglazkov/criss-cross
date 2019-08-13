'use strict';

const {expect} = require('chai');
const {Game, Player} = require('../lib/domain');

describe('Game', () => {
  let game;
  let player, bot;

  beforeEach(() => {
    game = new Game();
    player = new Player('Nick', 'x');
    bot = new Player('Bot', 'o');

  });

  describe('#register', () => {
    it('adds given players @players array', () => {
      game.register(player, bot);
      expect(game.players).lengthOf(2);
      expect(game.players[0]).eq(player);
      expect(game.players[1]).eq(bot);
    });
  });

  describe('#put', () => {
    beforeEach(() => {
      game.register(player, bot);
    });

    it('puts given mark to given coordinates', () => {
      game.put(1, 1, player);
      expect(game.values[1][1]).eq(player.mark);
    });

    it('puts given mark only to given coordinates', () => {
      game.put(0, 0, player);
      for (let i = 1; i < game.size; i++)
        for (let j = 1; j < game.size; j++)
          expect(game.values[i][j]).is.null;
    });

    it('passes the move to another player', () => {
      game.put(1, 1, player);
      expect(game.currentPlayer).eql(bot);
    });

    it('runs around the circle', () => {
      game.put(0, 1, player);
      game.put(1, 0, bot);
      expect(game.currentPlayer).eql(player);
    });

    it('does not allow pass the wrong player', () => {
      expect(() => game.put(0, 1, bot)).throws('Wrong player order');
    });

    it('does not allow put value over the field', () => {
      const examples = [
        [0, -1],
        [0, game.size],
        [-1, 0],
        [game.size, 0],
      ];
      for (let example of examples)
        expect(() => game.put(example[0], example[1], player)).throws('out of range');
    });

    it('does not allow put value to busy cell', () => {
      game.put(1, 1, player);
      expect(() => game.put(1, 1, bot)).throws('Cell [1,1] is already busy');
    });
  });
});