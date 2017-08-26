'use strict';

const compileServer = require('oc-server-compiler');
const createCompile = require('oc-generic-template-compiler').createCompile;
const getInfo = require('oc-template-jade').getInfo;

const compileStatics = require('./compileStatics');
const compileView = require('./compileView');

// OPTIONS
// =======
// componentPath
// componentPackage,
// logger,
// minify
// ocPackage
// publishPath
// verbose,
// watch,
module.exports = createCompile({
  compileServer,
  compileStatics,
  compileView,
  getInfo
});
