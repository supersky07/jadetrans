'use strict'

var path = require('path');
var commitFiles = require('./core/commitFiles.js');

module.exports = doTransform;

function doTransform (target_path_arr) {
	if (target_path_arr.length === 0) {
		temp_path = process.cwd();

		commitFiles(temp_path);
		return;
	}

	for (var i = 0; i < target_path_arr.length; i++) {
		var temp_path = target_path_arr[i];

		if (!temp_path.match(/^[\.\\/]/)) {
			temp_path = './' + temp_path;
		}

		//处理相对路径的情况
		temp_path = path.normalize(temp_path);

		if (!temp_path.match(/^\//)) {
			temp_path = process.cwd() + '/' + temp_path;
		}

		if (temp_path.indexOf('jadetrans') > -1) {
			continue;
		}

		commitFiles(temp_path);
	}
};