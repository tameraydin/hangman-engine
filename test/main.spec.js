if (typeof hangmanEngine === 'undefined') {
  var hangmanEngine = require('../src/main.js');
}

describe('hangman-engine', function() {
  var module, game;

  beforeEach(function() {
    module = hangmanEngine;
    module.reset();
  });

  describe('module', function() {

    it('should contain all methods', function() {
      expect(module.configure).toBeDefined();
      expect(module.newGame).toBeDefined();

      expect(module.config).toBeDefined();
    });
  });

  describe('configure() & reset()', function() {

    it('should work', function() {
      module.configure();
      game = module.newGame('test');
      expect(game.config.MAX_ATTEMPT).toBe(10);

      module.configure({
        MAX_ATTEMPT: 5,
        NON_EXISTING: 'test'
      });
      game = module.newGame('test');

      expect(game.config.MAX_ATTEMPT).toBe(5);
      expect(game.config.NON_EXISTING).not.toBeDefined();

      module.reset();
      game = module.newGame('test');
      expect(game.config.MAX_ATTEMPT).toBe(10);
    });
  });

  describe('newGame()', function() {
    beforeEach(function() {
      game = module.newGame('test');
    });

    it('should return a game object', function() {
      expect(game.on).toBeDefined();
      expect(game.guess).toBeDefined();
      expect(game.end).toBeDefined();
      expect(game.hint).toBeDefined();

      expect(game.word).toBeDefined();
      expect(game.guesses).toBeDefined();
      expect(game.matches).toBeDefined();
      expect(game.misses).toBeDefined();
      expect(game.config).toBeDefined();
    });

    it('should get default config', function() {
      expect(game.config.MAX_ATTEMPT).toBe(10);
    });
  });
});
