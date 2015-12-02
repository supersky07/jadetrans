# jadeTransform for RIA

# Just for us

# install
	npm install jadetrans - g

# usage
	Usage: jadetrans {options}
	Standard Options:
		--path, -p the path you want to transform.

# example
	var test = require('jadetrans');
	test('some directory path');

	or

	jadetrans -p 'some path'

	or 

	jadetrans

# Tips
	- The path can be a directory or a file.
	- If you do not specify the path, the current path will be the default.