if (typeof hangmanEngine === 'undefined') {
  var hangmanEngine = require('../src/main.js');
}

describe('hangman-engine', function() {
  var module,
    game,
    STATUSES = ['PENDING', 'STARTED', 'QUIT', 'WON', 'LOST'],
    listener = {
      start: function() {},
      guess: function() {},
      end: function() {}
    };

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
      expect(game.config.maxAttempt).toBe(10);

      module.configure({
        maxAttempt: 5,
        nonExisting: 'test'
      });
      game = module.newGame('test');

      expect(game.config.maxAttempt).toBe(5);
      expect(game.config.nonExisting).not.toBeDefined();

      module.reset();
      game = module.newGame('test');
      expect(game.config.maxAttempt).toBe(10);
    });
  });

  describe('newGame()', function() {
    beforeEach(function() {
      game = module.newGame('test');

      spyOn(listener, 'start');
      spyOn(listener, 'guess');
      spyOn(listener, 'end');
    });

    it('should return a game object', function() {
      expect(game.on).toBeDefined();
      expect(game.guess).toBeDefined();
      expect(game.end).toBeDefined();
      expect(game.hint).toBeDefined();

      expect(game.status).toBe(STATUSES[0]);
      expect(game.characters).toBeDefined();
      expect(game.guesses).toBeDefined();
      expect(game.hits).toBeDefined();
      expect(game.misses).toBeDefined();
      expect(game.config).toBeDefined();
    });

    it('should get default config', function() {
      expect(game.config.maxAttempt).toBe(10);
    });

    it('should accept multi words', function() {
      expect(game.characters).toEqual(['t', 'e', 's']);

      game = module.newGame('test phrase ');
      expect(game.characters).toEqual(['t', 'e', 's', 'p', 'h', 'r', 'a']);

      game = module.newGame(null);
      expect(game.characters).toEqual([]);
    });

    it('on() should work', function() {
      game.on('start', 'invalid');
      expect(game.listeners.start).toBe(null);

      game.on('invalid', listener.start);
      expect(game.listeners.invalid).toBe(undefined);

      game.on('start', listener.start);
      expect(game.listeners.start).toEqual(listener.start);
    });

    it('start() should work', function() {
      game.on('start', listener.start);
      game.start();
      expect(game.status).toBe(STATUSES[1]);
      expect(listener.start).toHaveBeenCalled();

      // started games cannot be started again:
      game.start();
      expect(listener.start.calls.count()).toEqual(1);

      // restart:
      game.guess('t');
      game.guess('x');
      game.start(true);
      expect(game.status).toBe(STATUSES[1]);
      expect(game.guesses).toEqual([]);
      expect(game.misses).toEqual([]);
      expect(listener.start.calls.count()).toEqual(2);
    });

    it('guess() should work', function() {
      game.on('guess', listener.guess);
      expect(game.guesses.length).toBe(0);

      // cannot guess before start:
      game.guess('t');
      expect(game.guesses.length).toBe(0);
      expect(listener.guess).not.toHaveBeenCalled();

      game.start();
      game.guess('t');
      expect(game.guesses.length).toBe(1);
      expect(game.hits.length).toBe(1);
      expect(game.misses.length).toBe(0);
      expect(listener.guess).toHaveBeenCalledWith('t', true, false);

      game.guess('x');
      expect(game.guesses.length).toBe(2);
      expect(game.hits.length).toBe(1);
      expect(game.misses.length).toBe(1);
      expect(listener.guess.calls.count()).toEqual(2);
      expect(listener.guess.calls.mostRecent().args).toEqual(['x', false, false]);

      game.guess(null);
      expect(game.guesses.length).toBe(2);
      expect(game.hits.length).toBe(1);
      expect(game.misses.length).toBe(1);
      expect(listener.guess.calls.count()).toEqual(2);

      game.guess(' ');
      expect(game.guesses.length).toBe(2);
      expect(game.hits.length).toBe(1);
      expect(game.misses.length).toBe(1);

      // takes first character:
      game.guess('ze');
      expect(game.guesses.length).toBe(3);
      expect(game.hits.length).toBe(1);
      expect(game.misses.length).toBe(2);

      game.guess('sx');
      expect(game.guesses.length).toBe(4);
      expect(game.hits.length).toBe(2);
      expect(game.misses.length).toBe(2);
    });

    it('hint() should work', function() {
      game.on('guess', listener.guess);
      game.start();

      game.hint();
      expect(game.hits.length).toBe(1);
      expect(listener.guess).toHaveBeenCalledWith('t', true, true);

      game.hint();
      expect(game.hits.length).toBe(2);
      expect(listener.guess).toHaveBeenCalledWith('e', true, true);

      // cannot guess if the game is ended:
      game.end();
      game.hint();
      expect(listener.guess.calls.count()).toEqual(2);
    });

    it('end() should work', function() {
      // quit:
      game.end();
      expect(game.status).toBe(STATUSES[2]);

      game.on('end', listener.end);
      game.start(true);
      game.end();
      expect(listener.end).toHaveBeenCalled();

      // ended games cannot be ended again:
      game.end();
      expect(listener.end.calls.count()).toEqual(1);

      game.start(true);
      game.end(STATUSES[3]);
      expect(game.status).toBe(STATUSES[3]);
      expect(listener.end.calls.count()).toEqual(2);
    });

    it('can be won', function() {
      var result = game
        .start()
        .guess('t')
        .guess('e')
        .guess('s');

      expect(result.status).toBe(STATUSES[3]);
    });

    it('can be lost', function() {
      var result = game
        .start()
        .guess('q')
        .guess('w')
        .guess('e')
        .guess('r')
        .guess('t')
        .guess('y')
        .guess('u')
        .guess('i')
        .guess('o')
        .guess('p');

      expect(result.status).toBe(STATUSES[4]);
    });
  });
});
