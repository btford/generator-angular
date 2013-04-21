'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var angularUtils = require('./util.js');

module.exports = Generator;

function Generator() {
  yeoman.generators.NamedBase.apply(this, arguments);

  try {
    this.appname = require(path.join(process.cwd(), 'component.json')).name;
  } catch (e) {
    this.appname = path.basename(process.cwd());
  }

  if (typeof this.env.options.appPath === 'undefined') {
    try {
      this.env.options.appPath = require(path.join(process.cwd(), 'component.json')).appPath;
    } catch (e) {}
    this.env.options.appPath = this.env.options.appPath || 'app';
  }

  if (typeof this.env.options.testPath === 'undefined') {
    try {
      this.env.options.testPath = require(path.join(process.cwd(), 'component.json')).testPath;
    } catch (e) {}
    this.env.options.testPath = this.env.options.testPath || 'test/spec';
  }

  if (typeof this.env.options.coffee === 'undefined') {
    this.option('coffee');

    // attempt to detect if user is using CS or not
    // if cml arg provided, use that; else look for the existence of cs
    if (!this.options.coffee &&
      this.expandFiles(path.join(this.env.options.appPath, '/scripts/**/*.coffee'), {}).length > 0) {
      this.options.coffee = true;
    }

    this.env.options.coffee = this.options.coffee;
  }

  if (typeof this.env.options.jade === 'undefined') {
    this.option('jade');

    // attempt to detect if user is using Jade or not
    // if cml arg provided, use that; else look for the existence of cs
    if (!this.options.jade &&
      this.expandFiles(path.join(this.env.options.appPath, '/**/*.jade'), {}).length > 0) {
      this.options.jade = true;
    }

    this.env.options.jade = this.options.jade;
  }

  if (typeof this.env.options.minsafe === 'undefined') {
    this.option('minsafe');
    this.env.options.minsafe = this.options.minsafe;
  }

  this.scriptRoot = '/javascript';
  this.scriptSuffix = '.js';

  this.markupRoot = '/templates/html';
  this.markupSuffix = '.html';

  if (this.env.options.coffee) {
    this.scriptRoot = '/coffeescript';
    this.scriptSuffix = '.coffee';
  }

  if (this.env.options.jade) {
    this.markupRoot = '/templates/jade';
    this.markupSuffix = '.jade';
  }

  if (this.env.options.minsafe) {
    this.scriptRoot += '-min';
  }

  this.sourceRoot(path.join(__dirname, '/templates'));
  this.markupRoot = path.join(__dirname, this.markupRoot);
}

util.inherits(Generator, yeoman.generators.NamedBase);


// generate .js or .coffee app files
Generator.prototype.appTemplate = function (src, dest) {
  yeoman.generators.Base.prototype.template.apply(this, [
    path.join(this.scriptRoot, src) + this.scriptSuffix,
    path.join(this.env.options.appPath, dest) + this.scriptSuffix
  ]);
};


// generate .js or .coffee test files
Generator.prototype.testTemplate = function (src, dest) {
  yeoman.generators.Base.prototype.template.apply(this, [
    path.join(this.scriptRoot, src) + this.scriptSuffix,
    path.join(this.env.options.testPath, dest) + this.scriptSuffix
  ]);
};


// Generate HTML or Jade
Generator.prototype.markupTemplate = function (src, dest) {
  yeoman.generators.Base.prototype.template.apply(this, [
    path.join(this.markupRoot, src) + this.markupSuffix,
    path.join(this.env.options.appPath, dest) + this.markupSuffix
  ]);
};

Generator.prototype.addScriptToIndex = function (script) {

  var needle = '<!-- endbuild -->';
  var splicable = '<script src="scripts/' + script + '.js"></script>';

  if (this.env.options.jade) {
    needle = '// endbuild';
    splicable = "script(src='scripts/" + script + ".js')";
  }

  try {
    var appPath = this.env.options.appPath;
    var fullPath = path.join(appPath, 'index' + this.scriptSuffix);
    angularUtils.rewriteFile({
      file: fullPath,
      needle: needle,
      splicable: [ splicable ]
    });
  } catch (e) {
    console.log('\nUnable to find '.yellow + fullPath + '. Reference to '.yellow + script + '.js ' + 'not added.\n'.yellow);
  }
};
