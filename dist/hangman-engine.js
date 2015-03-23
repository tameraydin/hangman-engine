/**
 * hangman-engine v0.1.0 (https://github.com/tameraydin/hangman-engine)
 * Copyright 2015 Tamer Aydin (http://tamerayd.in)
 * Licensed under MIT
 */
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
    maxAttempt: 10,
    concealCharacter: '*'
  };

  var HangmanGame = function(phrase, config) {
    var uniqueCharacters = [];
    var characterMap = {};

    if (phrase && typeof phrase === 'string') {
      phrase.trim().split('').forEach(function(character, index) {
        if (characterMap[character]) {
          characterMap[character].push(index);
        } else {
          characterMap[character] = [index];
        }

        if (character !== ' ' &&
            uniqueCharacters.indexOf(character) === -1) {
          uniqueCharacters.push(character);
        }
      });
    }

    this.status = STATUSES[0];
    this.characterMap = characterMap;
    this.characters = uniqueCharacters;
    this.guesses = [];
    this.hits = [];
    this.misses = [];
    this.config = config;
    this.listeners = {
      start: null,
      guess: null,
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
        if (force) {
          this.guesses = [];
          this.hits = [];
          this.misses = [];
        }

        this.status = STATUSES[1];
        if (this.listeners.start) {
          this.listeners.start.call(this);
        }
      }

      return this;
    },
    guess: function(character, isHint) {
      if (this.status === STATUSES[1] && typeof character === 'string') {
        var hit;

        character = character[0].trim();
        if (character) {
          if (this.characters.indexOf(character) > -1) {
            hit = this.hits.push(character);
          } else {
            this.misses.push(character);
          }

          this.guesses.push(character);
          if (this.listeners.guess) {
            this.listeners.guess.call(this, character, !!hit, !!isHint);
          }

          if (this.hits.length === this.characters.length) {
            this.end(STATUSES[3]);

          } else if (this.guesses.length === this.config.maxAttempt) {
            this.end(STATUSES[4]);
          }
        }
      }

      return this;
    },
    hint: function() {
      if (this.status === STATUSES[1]) {
        var i;

        for (i = 0; i < this.characters.length; i++) {
          var character = this.characters[i];

          if (this.hits.indexOf(character) === -1) {
            this.guess(character, true);
            break;
          }
        }
      }

      return this;
    },
    end: function(status) {
      if (STATUSES.indexOf(this.status) < 2) {
        if (status && STATUSES.indexOf(status) < 2) {
          return this;
        }

        this.status = status || STATUSES[2];
        if (this.listeners.end) {
          this.listeners.end.call(this);
        }
      }

      return this;
    },
    getConcealedPhrase: function() {
      var key,
        concealCharacter = this.config.concealCharacter,
        hits = this.hits,
        characters = [];

      function _addToCharactersList(index) {
        characters[index] = (key !== ' ' && hits.indexOf(key) === -1) ?
          concealCharacter : key;
      }

      for (key in this.characterMap) {
        this.characterMap[key].forEach(_addToCharactersList);
      }

      return characters.join('');
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
