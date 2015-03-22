(function() {
  'use strict';

  function _copy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  var DEFAULT_SETTINGS = {
    MAX_ATTEMPT: 10
  };

  var HangmanGame = function(word, config) {
    this.word = word || '';
    this.guesses = [];
    this.matches = [];
    this.misses = [];
    this.config = config || {};
  };

  HangmanGame.prototype = {
    on: function() {
      // TODO
    },
    guess: function() {
      // TODO
    },
    end: function() {
      // TODO
    },
    hint: function() {
      // TODO
    }
  };

  var HangmanEngine = function() {
    this.config = _copy(DEFAULT_SETTINGS);
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
      this.config = _copy(DEFAULT_SETTINGS);
    },
    newGame: function(word) {
      return new HangmanGame(word, _copy(this.config));
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
