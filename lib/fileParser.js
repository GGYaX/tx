/**
 * Dependencies :
**/
var fs = require('fs');
var lazy = require('lazy');
var dataGisol = require('./dataGisol.js');
var dataParser = require('./parser.js').dataParser;
var dataTransformer = require('./parser.js').dataTransformer;

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
				if(i > 1) {
					throw 'sdfsdf';
				}
				// call parser to parse 
				// console.log(line.toString());
				dataParser(line.toString(), 3000, ',', globalConf['tablePrefix']['3000'], function(err, data) {
					if(err) {
						console.log(err);
					} else {
						dataTransformer(data, 3000);
						console.log(data);
						var time, date;
						time = data.time.value.split(' ')[1];
						date = data.time.value.split(' ')[0];
					}
				});
			});
	} else {
		callback(new Error(errorDesc['2001']));
	}
}

fileParser('./file.dat');