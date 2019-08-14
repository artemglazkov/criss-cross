'use strict';

const {expect} = require('chai');
const {User, Player, Game} = require('../lib/domain');

describe('Game', () => {
  let game;
  let man, bot;

  beforeEach(() => {
    game = new Game(2);
    man = new User('Nick');
    bot = new User('Bot');
  });

  describe('#constructor', () => {
    it('adds 2 players with marks', () => {
      expect(game.players).lengthOf(2);
      expect(game.players[0].mark).eq('x');
      expect(game.players[1].mark).eq('o');
    });
  });

  describe('#register', () => {
    it('sets @user to man', () => {
      game.register(man);
      expect(game.players[0].user).eq(man);
      expect(game.players[1].user).is.undefined;
    });

    it('returns registered man', () => {
      let res = game.register(man);
      expect(res).instanceOf(Player);
      expect(res.user).eq(man);
    });

    it('sets @user to first unregistered man', () => {
      game.register(man);
      game.register(bot);
      expect(game.players[0].user).eq(man);
      expect(game.players[1].user).eq(bot);
    });

    it('does not reset registered players', () => {
      game.register(man);
      game.register(bot);
      game.register(new User('Another'));
      expect(game.players[0].user).eq(man);
      expect(game.players[1].user).eq(bot);
    });
  });

  describe('#put', () => {
    beforeEach(() => {
      game.register(man);
      game.register(bot);
    });

    it('puts mark to given coordinates', () => {
      game.put(1, 1, game.players[0]);
      expect(game.values[1][1]).eq(game.players[0].mark);
    });

    it('puts given mark only to given coordinates', () => {
      game.put(0, 0, game.players[0]);
      for (let i = 1; i < game.size; i++)
        for (let j = 1; j < game.size; j++)
          expect(game.values[i][j]).is.null;
    });

    it('passes the move to another man', () => {
      game.put(1, 1, game.players[0]);
      expect(game.currentPlayer).eq(game.players[1]);
    });

    it('runs around the circle', () => {
      game.put(0, 1, game.players[0]);
      game.put(1, 0, game.players[1]);
      expect(game.currentPlayer).eql(game.players[0]);
    });

    it('does not allow pass the wrong player', () => {
      expect(() => game.put(0, 1, game.players[1])).throws('Wrong player order');
    });

    it('does not allow put value over the field', () => {
      const examples = [
        [0, -1],
        [0, game.size],
        [-1, 0],
        [game.size, 0],
      ];
      for (let example of examples)
        expect(() => game.put(example[0], example[1], game.players[0])).throws('out of range');
    });

    it('does not allow put value to busy cell', () => {
      game.put(1, 1, game.players[0]);
      expect(() => game.put(1, 1, game.players[1])).throws('Cell [1,1] is already busy');
    });

    describe('when nobody wins', () => {
      beforeEach(() => {
        game.put(1, 1, game.players[0]);
      });

      it('sets @winner to current player', () => {
        expect(game.winner).is.null;
      });

      it('sets @isOver to True', () => {
        expect(game.isOver).eq(false);
      });
    });

    describe('when player wins', () => {
      beforeEach(() => {
        game.values = [
          ['x', null],
          [null, null],
        ];
        game.put(1, 1, game.players[0]);
      });

      it('sets @winner to current player', () => {
        expect(game.winner).eq(game.players[0]);
      });

      it('sets @isOver to True', () => {
        expect(game.isOver).eq(true);
      });

      it('does not allow move anymore', () => {
        expect(() => game.put(0, 1, game.players[1])).throws('Game is over');
      });
    });
  });

});