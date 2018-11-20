#!/usr/bin/env node
/*
 * -h, --help
 * -v, --version
 * -s, --string
 * path
 * desPath
 */

var program = require('commander');
var doCommit = require('../index');
 
program
  .version(require('../package.json').version)
  .option('-p, --path [transformPath]', 'transform path', 'default')
  .parse(process.argv);

if (program.path !== 'default'){
    doCommit([program.path]);   
} else {
    doCommit(process.argv);
}