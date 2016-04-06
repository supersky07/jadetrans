'use strict'

var path = require('path');
var commitFiles = require('./core/commitFiles.js');

module.exports = doTransform;

function doTransform (target_path) {
	if (!target_path || target_path == '') {
		//获取当前目录
		target_path = process.cwd();
	}

	//处理相对路径的情况
	target_path = path.normalize(target_path);

	if (!target_path.match(/^\//)) {
		target_path = process.cwd() + '/' + target_path;
	}

	commitFiles(target_path);
};