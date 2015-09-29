'use strict'

var _os = require('os');
var _fs = require('fs');
var _http = require('http');
var _path = require('path');
var _utils = require('./utils');
var _walkfiles = require('walkfiles');
var _exec = require('child_process').exec;

var fileFormat = 'utf-8';
var isWin = _os.type().indexOf('Windows') > -1 ? true : false;
var filePath = '';
var submitFileExtension = 'jade|json';

var osTempdir  = _os.tmpdir();
var md5file = osTempdir + '/' + 'md5Mapping.txt';
if (isWin) {
    md5file = osTempdir + '\\' + 'md5Mapping.txt';
}

module.exports = function (path, reg) {
	//判断path是否是_views下的目录
	if (path.indexOf('_views') == -1) {
		console.log('Error:')
		console.log('The jade file must be under "_views".')
		return;
	}

	filePath = path;
	findPackage(filePath, doTransform);
};

//递归向上级目录查找package.json
var findPackage = function (localPath, cb) {
	var tempPath = _path.dirname(localPath);
	var packagePath = _path.join(tempPath, 'package.json');

	if (_fs.existsSync(packagePath)) {
		_fs.readFile(packagePath, function(err, data){
			if (err) {
				console.log('Error:');
				console.log('Read package.json error!');
				return;
			}

			var resJson = JSON.parse(data);

			if (!resJson.hostname) {
				console.log('Error:');
				console.log('You must set the hostname of your package.json!');
				return;
			}
			cb && cb(resJson);
		});
	} else {
		if (tempPath !== _path.dirname(tempPath)) {
            findPackage(tempPath, cb);
        }
	}
};

var doTransform = function (package_json) {
	if (package_json.newWebos) {
		console.log('\n******* this is the new WebOS transform *******\n');
	} else {
		package_json.newWebos = '';
	}

	if (!package_json.phpClassName) {
		package_json.phpClassName = 'Comm_Jade::'
	}

	//有后缀，就是单个文件
	if (_path.extname(filePath) != '') {
		transformSingleFile(package_json);
	} else {
		transformAllFiles(package_json);
	}
};

var transformAllFiles = function (package_json) {
	var allFiles = _walkfiles(filePath, submitFileExtension);
	allFiles = _utils.filterFilesWithMd5(allFiles, md5file);

	var len = allFiles.length;
	var count = 0;
	var successNum = 0;
	var failNum = 0;

	var requestTransform = function(){
		if (len <= 0) {
			console.log('\nNo jade file needs transform. \n');
			return;
		}

		var jadeFilePath = _utils.getjadeFilePath(allFiles[count]);
		jadeFilePath = _utils.handlePath(jadeFilePath);
		
        var num = (count + 1 == len) ? 1 : 0;
        var svn_user_name = (num == 1 ? 'test' : '');

		var fileContent =  _fs.readFileSync(allFiles[count], fileFormat);

		var opts = {
			hostname : package_json.hostname,
			port     : '3000',
			path     : '/jadeFileSubmit?filePath='+encodeURIComponent(jadeFilePath)+
									'&proName='+package_json.name+
									'&phpSvnPath='+package_json.phpSvnPath+
									'&newWebos='+package_json.newWebos+
									'&phpClassName='+package_json.phpClassName+
									'&end='+num+'&'+
									'localSvnUserName='+svn_user_name,
			method   : 'POST'
		};

		var allResponseData = '';

		var req = _http.request(opts, function(res){
			res.setEncoding('utf8');
			res.on('data', function(data) {
                if (data === '.') {
                	process.stdout.write(data);
                } else {
                	console.log('transforming:: ' + data);
                    allResponseData += data;
                }
			}).on('end', function(){
				if (allResponseData.indexOf('Error') == -1) {
					_utils.writeToMd5File(fileContent, jadeFilePath, md5file);
					successNum++;
                } else {
                	failNum++;
                }

				console.log('\n');
				if (count < len - 1) {
					count++;
					requestTransform();
				} else {
					console.log('All files finished. ' + len + ' files have been transformed!');
					if (failNum != 0) {
						console.log('But, ' + failNum + ' file failed!')
					}
				}
			});
		});

		req.on('error', function (e){
			console.log('problem with request: ' + e.message);
		});

		req.write(fileContent + '\n');
		
		req.end();
	};

	requestTransform();
};

var transformSingleFile = function (package_json) {
    var jadeFilePath = _utils.getjadeFilePath(filePath);
	var fileContent = _fs.readFileSync(filePath, fileFormat);

	var opts = {
		hostname : package_json.hostname,
		port     : '3000',
		path     : '/jadeFileSubmit?filePath='+encodeURIComponent(jadeFilePath)+
								'&proName='+package_json.name+
								'&newWebos='+package_json.newWebos+
								'&phpClassName='+package_json.phpClassName+
								'&phpSvnPath='+package_json.phpSvnPath+
								'&end=1&'+
								'localSvnUserName=test',
		method   : 'POST'
	};

	var allResponseData = '';
	var req = _http.request(opts, function(res){
		res.setEncoding('utf8');
		res.on('data', function(data) {
			if (data === '.') {
            	process.stdout.write(data);
            } else {
                console.log("transforming:: " + data);
                allResponseData += data;
            }
		}).on('end', function(){
			if (allResponseData.indexOf('Error') == -1) {
				_utils.writeToMd5File(fileContent, jadeFilePath, md5file);
				console.log('\nRequest back, transform successfully!\n');
            } else {
            	console.log('\nRequest back, but transform failed!');
            }
		});
	});

	req.on('error', function (e){
		console.log('problem with request: ' + e.message);
	});

	req.write(fileContent + '\n');

	req.end();
};