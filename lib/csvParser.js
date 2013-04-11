/**
 * Dependencies :
**/
var fs = require('fs');
var lazy = require('lazy');
var dataGisol = require('./dataGisol.js');
var parser = require('./parser.js');

try {
	var globalConf = JSON.parse(fs.readFileSync('../config/config.json'));
} catch(err) {
	console.log(err);
	console.log("Can't start, configuration file can't be loaded.");
	process.exit(-1);
}

try {
	var errorDesc = JSON.parse(fs.readFileSync('../config/errorDesc.json'));
} catch(err) {
	console.log(err);
	console.log("Can't start, error description file can't be loaded.");
	process.exit(-1);
}

/* Functions */
// filename with fullpath
function fileParser(filename, callback) {
	if(fs.existsSync(filename)) {
		var readOptions = {
			flags: 'r',
			mode: 0666,
			encoding: 'utf8'
		};
		// create file read stream
		var stream = fs.createReadStream(filename, readOptions);
		var i = 0;
		// create lazy
		new lazy(stream)
			.lines
			.skip(4) // skip the 4 first lines
			.forEach(function(line) {
				i++;
				if(i > 2) {
					throw 'sdfsdf';
				}
				// call parser to parse 
				// console.log(line.toString());
				parser(line.toString(), 3000, ',', function(err, data) {
					if(err) {
						console.log(err);
					} else {
						console.log(data);
						var time, date;
						time = data.time.value.split(' ')[1];
						date = data.time.value.split(' ')[0];
					}
				});
			});
	} else {
		callback(new Error('File does not exist.'));
	}
}

fileParser('./file.dat');