'use strict'

var commitFiles = require('./core/commitFiles.js');

module.exports = doTransform;

function doTransform (path, reg) {
	if (!path || path == '') {
		//获取当前目录
		path = process.cwd();
	} 
		
	commitFiles(path, reg);
};