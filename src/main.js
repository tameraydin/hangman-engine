(function() {
  'use strict';

  function _copy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  var STATUSES = [
    'PENDING',
    'STARTED',
    'QUIT',
    'WON',
    'LOST'
  ];

  var DEFAULT_CONFIG = {
    maxAttempt: 10
  };

  var HangmanGame = function(phrase, config) {
    var uniqueCharacters = [];

    if (phrase && typeof phrase === 'string') {
      phrase.trim().split('').forEach(function(character) {
        if (character &&
            character !== ' ' &&
            uniqueCharacters.indexOf(character) === -1) {
          uniqueCharacters.push(character);
        }
      });
    }

    this.status = STATUSES[0];
    this.characters = uniqueCharacters;
    this.guesses = [];
    this.hits = [];
    this.misses = [];
    this.config = config;
    this.listeners = {
      start: null,
      guess: null,
      hit: null,
      miss: null,
      end: null
    };
  };

  HangmanGame.prototype = {
    on: function(listener, callback) {
      if (this.listeners.hasOwnProperty(listener) &&
          typeof callback === 'function') {
        this.listeners[listener] = callback;
      }

      return this;
    },
    start: function(force) {
      if (force || this.status === STATUSES[0]) {
        this.status = STATUSES[1];

        if (force) {
          this.guesses = [];
          this.hits = [];
          this.misses = [];
        }

        if (this.listeners.start) {
          this.listeners.start.call(this);
        }
      }

      return this;
    },
    guess: function(character) {
      if (this.status === STATUSES[1] && typeof character === 'string') {
        character = character[0].trim();

        if (character) {
          if (this.characters.indexOf(character) > -1) {
            this.hits.push(character);
            if (this.listeners.hit) {
              this.listeners.hit.call(this, character);
            }

          } else {
            this.misses.push(character);
            if (this.listeners.miss) {
              this.listeners.miss.call(this, character);
            }
          }

          this.guesses.push(character);
          if (this.listeners.guess) {
            this.listeners.guess.call(this, character);
          }

          if (this.guesses.length === this.config.maxAttempt) {
            this.end(STATUSES[
              this.hits.length === this.characters.length ? 3 : 4]);
          }
        }
      }

      return this;
    },
    end: function(status) {
      if (STATUSES.indexOf(this.status) < 2) {
        this.status = status || STATUSES[2];
        if (this.listeners.end) {
          this.listeners.end.call(this);
        }
      }

      return this;
    },
    hint: function() {
      // TODO
    }
  };

  var HangmanEngine = function() {
    this.config = _copy(DEFAULT_CONFIG);
  };

  HangmanEngine.prototype = {
    configure: function(config) {
      if (config) {
        var key;

        for (key in config) {
          if (this.config[key]) {
            this.config[key] = config[key];
          }
        }
      }
    },
    reset: function() {
      this.config = _copy(DEFAULT_CONFIG);
    },
    newGame: function(phrase) {
      return new HangmanGame(phrase, _copy(this.config));
    }
  };

  var hangmanEngine = new HangmanEngine();

  // EXPORT
  var root = this;

  /* istanbul ignore next */
  if (typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports) {
      module.exports = hangmanEngine;

  } else {
    if (typeof define === 'function' && define.amd) {
      define('hangmanEngine', [], function() {
        return hangmanEngine;
      });

    } else {
      root.hangmanEngine = hangmanEngine;
    }
  }

}).call(this);
