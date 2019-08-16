'use strict';

const {expect} = require('chai');
const {Human, Bot, Player, Game, BotStrategy} = require('../lib/domain');

describe('Game', () => {
  let game;
  let frodo, sam, bot;

  beforeEach(() => {
    game = new Game();
    frodo = new Human('Frodo');
    sam = new Human('Sam');
    bot = new Bot(BotStrategy.firstAvailable);
  });

  describe('#constructor', () => {
    it('adds 2 players with marks', () => {
      expect(game.players).lengthOf(2);
      expect(game.players[0].mark).eq('x');
      expect(game.players[1].mark).eq('o');
    });
  });

  describe('#register', () => {
    describe('when index is not specified', () => {
      it('sets user to player', () => {
        game.register(frodo);
        expect(game.players[0].profile).eq(frodo);
        expect(game.players[1].profile).is.undefined;
      });

      it('returns registered player', () => {
        let res = game.register(frodo);
        expect(res).instanceOf(Player);
        expect(res.profile).eq(frodo);
      });

      it('sets user to first unregistered player', () => {
        game.register(frodo);
        game.register(sam);
        expect(game.players[0].profile).eq(frodo);
        expect(game.players[1].profile).eq(sam);
      });

      it('does not reset registered players', () => {
        game.register(frodo);
        game.register(sam);
        game.register(new Human('Gandalf'));
        expect(game.players[0].profile).eq(frodo);
        expect(game.players[1].profile).eq(sam);
      });

      it('starts the game when all players registered an the first one is a Bot', () => {
        game.register(bot);
        game.register(frodo);
        expect(game.turns).eq(1);
        expect(game.currentPlayer).eq(game.players[1]);
      });
    });

    describe('when index is specified', () => {
      it('sets @user to player at given index', () => {
        game.register(frodo, 1);
        expect(game.players[1].profile).eq(frodo);
      });

      it('returns registered player', () => {
        let res = game.register(frodo, 1);
        expect(res).instanceOf(Player);
        expect(res.profile).eq(frodo);
      });

      it('resets registered player', () => {
        game.register(frodo, 1);
        game.register(sam, 1);
        expect(game.players[1].profile).eq(sam);
      });
    });
  });

  describe('#put', () => {
    beforeEach(() => {
      game.register(frodo);
      game.register(sam);
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

    it('passes the move to another frodo', () => {
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

    describe('checks the win', () => {
      beforeEach(() => {
        game.values = [
          [null, 'x', 'x'],
          ['x', 'x', null],
          [null, null, null],
        ]
      });

      it('by row', () => {
        game.put(0, 0, game.players[0]);
        expect(game.winner).eq(game.players[0]);
      });

      it('by column', () => {
        game.put(2, 1, game.players[0]);
        expect(game.winner).eq(game.players[0]);
      });

      it('by diagonal 1', () => {
        game.values[0][0] = 'x';
        game.put(2, 2, game.players[0]);
        expect(game.winner).eq(game.players[0]);
      });

      it('by diagonal 2', () => {
        game.put(2, 0, game.players[0]);
        expect(game.winner).eq(game.players[0]);
      });
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
          ['x', null, null],
          [null, null, null],
          [null, null, 'x'],
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

    describe('when second player is a Bot', () => {
      beforeEach(() => {
        game.register(bot, 1);
      });

      it('plays as as sam automatically', () => {
        game.put(1, 1, game.players[0]);
        expect(game.turns).eq(2);
        expect(game.values[0][0]).eq(game.players[1].mark);
        expect(game.currentPlayer).eq(game.players[0]);
      });

      it('plays with a Bot till the end', () => {
        game.put(0, 0, game.players[0]);
        game.put(1, 0, game.players[0]);
        game.put(1, 1, game.players[0]);
        game.put(2, 1, game.players[0]);
        game.put(2, 2, game.players[0]);
        expect(game.turns).eq(9);
        expect(game.isOver).eq(true);
      });
    });
  });

  describe('#json', () => {
    it('returns json of the game', () => {
      const json = game.json();
      expect(json).eql({
        values: game.values,
        isOver: false,
        winner: undefined
      });
    });

    it('returns json of finished game', () => {
      game.register(frodo);
      game.register(bot);
      game.winner = game.players[1];
      const json = game.json();
      expect(json).eql({
        values: game.values,
        isOver: true,
        winner: {
          id: game.players[1].id,
          name: bot.name,
          mark: 'o'
        }
      });
    });
  });

  describe('@isPending', () => {
    it('returns True when there is at least one unregistered Player', () => {
      game.register(frodo);
      expect(game.isPending).eq(true);
    });

    it('returns False when there are not any unregistered Player', () => {
      game.register(frodo);
      game.register(sam);
      expect(game.isPending).eq(false);
    });
  });

});