'use strict'

var _fs = require('fs');
var _path = require('path');
var _crypto  = require('crypto');

var fileFormat = 'utf-8';

var utils = {
	handlePath: function(jadepath){
		jadepath.replace(/(\\+)/g, function(a){
			jadepath = jadepath.replace(a, '\\');
		});
		return jadepath;
	},
	syncMD5forFile: function(str){
		var hash = _crypto.createHash('md5').update(str).digest("hex").substr(0,16);
	    return hash;
	},
	getjadeFilePath: function(localPath){
		var shortLocalPath = localPath.slice(localPath.indexOf('_views'));
	    shortLocalPath = _path.normalize(shortLocalPath);
		return shortLocalPath.replace(/_views/, '');
	},
	filterFilesWithMd5: function (filterFiles, md5filepath) {
		var tempFiles = [];

		if (!_fs.existsSync(md5filepath)) {
			return filterFiles;
		}

		var md5json = JSON.parse(_fs.readFileSync(md5filepath, fileFormat));

		for (var i = 0; i < filterFiles.length; i++) {
	    	var jadeFilePath = utils.getjadeFilePath(filterFiles[i]);
	        var md5Hash = md5json[jadeFilePath];
	        var filestr = _fs.readFileSync(filterFiles[i], fileFormat);
	        var newHash = utils.syncMD5forFile(filestr);
	        if(md5Hash != newHash){
	            tempFiles.push(filterFiles[i]);
	        }
		}

		return tempFiles;
	},
	writeToMd5File: function (fileContent, jadeFilePath, md5file) {
		var md5json = {};
		var	hash = utils.syncMD5forFile(fileContent);

		if(_fs.existsSync(md5file)){
			md5json = JSON.parse(_fs.readFileSync(md5file, fileFormat));
		}

		md5json[jadeFilePath] = hash;
		console.log(jadeFilePath + ' has been written to md5 file!');
		_fs.writeFileSync(md5file, JSON.stringify(md5json), fileFormat);
	}
};

module.exports = utils;