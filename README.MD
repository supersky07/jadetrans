# jadeTransform for RIA

# install
	npm install jadetrans - g

# usage
	Usage: jadetrans {options}
	Standard Options:
		--path, -p the path you want to transform.
		--reg, -r not support.

# example
	var test = require('jadetrans');
	test('some directory path');

	or

	jadetrans -p 'some path'

# Tips
	- The path can be a directory or a file.
	- If you do not specify the path, the current path will be the default.