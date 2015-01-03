/*
 * typeout.js
 *
 * Copyright 2014, Connor Atherton - http://connoratherton.com/
 * Released under the MIT Licence
 * http://opensource.org/licenses/MIT
 *
 * Github:  http://github.com/ConnorAtherton/typeout
 */

'use strict';
// TODO Take gif of it working and add it to readme

var aq = require('aqueue');

/*
 *  Default options.
 */
var defaults = {
  interval: 3000,
  completeClass: 'typeout-complete',
  callback : function noop() {},
  numLoops: Infinity,
  max: 100,
  min: 30
};

var typeout = function(selector, words, options) {
  options = merge(defaults, (options || {}));
  options.words = words;

  var el = document.querySelector(selector);
  var shouldStartType = true;
  var aqueue = aq();

  initialSetup();

  function initialSetup() {
    var html = el.innerHTML.trim();
    if (html !== "") {
      shouldStartType = false;
      options.words.unshift(html);
    }

    // start the spin loop
    startLoop();
  };

  function startLoop() {
    var stop = false;
    var loops = 0;
    var currentElIndex = 0;
    var listLength = options.words.length;
    var stopping = false;

    options.words.forEach(function(el, i) {
      aqueue(type, options.words[currentElIndex]);

      if (currentElIndex === listLength - 1) {
        aqueue(callback, null);
      } else {
        aqueue(pause, options.interval)(deleteWord, null);
      }

      currentElIndex++;

      if (currentElIndex === listLength) currentElIndex = 0;
    });
  };

  function type(word, next) {
    var progress = 0;
    var wordLength = word.length;

    var interval = setInterval(function() {

      if (progress < wordLength) {
        el.innerHTML += word[progress];
        progress++;
      } else {
        window.clearInterval(interval);
        next();
      }

    }, getSpeed());
  };

  /*
   * BUG - aq won't invoke the function if no argument is passed which is kinda weird
   */
  function deleteWord(_, next) {
    var interval = setInterval(function() {
      var current = el.innerHTML;
      var length  = current.length;

      if (!length) {
        clearInterval(interval);
        next();
      }

      el.innerHTML = current.substring(0, length - 1);
    }, getSpeed());
  };

  function getSpeed() {
    var max = options.max;
    var min = options.min;

    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  function pause(timeout, next) {
    setTimeout(function() {
      next()
    }, timeout);
  };

  function callback() {
    addClass(el, options.completeClass);
    options.callback(el);
  }
};

/*
 *  Merges two objects together.
 *
 *  Properties in the second object have higher
 *  precedence than corresponding properties in
 *  the first
 */
function merge(source, target) {
  var obj = {};

  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      obj[key] = (typeof target[key] !== "undefined") ? target[key] : source[key];
    }
  }

  return obj;
}

/*
 *  Adds a class.
 *
 *  Used when the word rotation is finished.
 */
function addClass(el, klass) {
  el.className += ' ' + klass;
}

global.typeout = typeout;

