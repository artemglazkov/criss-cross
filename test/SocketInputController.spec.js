'use strict';

const chai = require('chai');
chai.use(require('sinon-chai'));

const {expect} = chai;
const sinon = require('sinon');
const {SocketInputController} = require('../lib/server');
const {Human, Game} = require('../lib/domain');

describe('SocketInputController', () => {
  let frodo, game;
  let socket, out, gameRegistry;
  let controller;

  beforeEach(() => {
    frodo = new Human();
    game = new Game();

    socket = {join: sinon.stub(), on: sinon.stub()};
    out = {join: sinon.stub(), status: sinon.stub(), statusError: sinon.stub()};
    gameRegistry = {add: sinon.stub(), findAvailable: sinon.stub(), findByPlayer: sinon.stub()};
    controller = new SocketInputController(socket, out, gameRegistry);
  });

  describe('#start', () => {
    it('creates a new Game', () => {
      controller.start(() => null);
      expect(gameRegistry.add).called;
      expect(gameRegistry.add.firstCall.args[0]).instanceOf(Game);
    });

    it('joins self to the Game', () => {
      controller.start(() => null);
      expect(gameRegistry.add).called;
      expect(gameRegistry.add.firstCall.args[0].players[0].profile).eq(controller.user);
    });

    it('joins to the socket room', () => {
      controller.start(() => null);
      const game = gameRegistry.add.firstCall.args[0];
      expect(socket.join).called;
      expect(socket.join.firstCall.args[0]).eq(game.id);
    });

    it('emits [join]', () => {
      controller.start(() => null);
      expect(out.join).called;
    });

    it('calls callback', () => {
      const callback = sinon.stub();
      controller.start(callback);
      const game = gameRegistry.add.firstCall.args[0];
      const player = game.players[0];
      expect(callback).called;
      expect(callback.firstCall.args[0]).eql({
        id: player.id,
        mark: player.mark,
        name: player.name,
      });
      expect(callback.firstCall.args[1]).eql({
        values: game.values,
        isOver: game.isOver,
        winner: undefined
      });
    });
  });

  describe('#join', () => {
    beforeEach(() => {
      gameRegistry.findAvailable.returns(game);
    });

    it('registers current user to the first available Game', () => {
      controller.join(() => null);
      expect(gameRegistry.findAvailable).called;
      expect(game.players[0].profile).eq(controller.user);
    });

    it('joins to the socket room', () => {
      controller.join(() => null);
      expect(socket.join).called;
      expect(socket.join.firstCall.args[0]).eq(game.id);
    });
  });

  describe('#put', () => {
    it('puts mark at given players game', () => {
      const player = game.register(frodo);
      gameRegistry.findByPlayer.returns(game);

      controller.put({playerId: player.id, x: 1, y: 1});

      expect(gameRegistry.findByPlayer).called;
      expect(gameRegistry.findByPlayer.firstCall.args[0]).eq(player.id);
      expect(game.values[1][1]).eq(player.mark);
    });
  });

});
