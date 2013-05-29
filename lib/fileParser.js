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
function fileParser(filename, position) {
	this.lineReaded = position;
	this.filename = filename;
}

fileParser.prototype.begin = function(callback) {
	if(fs.existsSync(this.filename)) {
		var readOptions = {
			flags: 'r',
			mode: 0666,
			encoding: 'utf8'
		};
		var that = this;
		// create file read stream
		var stream = fs.createReadStream(this.filename, readOptions);
		// create lazy
		new lazy(stream)
			.lines
			.skip(that.lineReaded) // skip the 4 first lines
			.forEach(function(line) {
				// call parser to parse 
				// console.log(line.toString());
				that.lineReaded ++;
				console.log(that.lineReaded);
				// console.log(line);
				dataParser(line.toString(), 3000, ',', globalConf['tablePrefix']['3000'], function(err, data) {
					if(err) {
						console.log(err);
					} else {
						dataTransformer(data, 3000);
						console.log(data);
						// var time, date;
						// time = data.time.value.split(' ')[1];
						// date = data.time.value.split(' ')[0];
					}
				});
			});
	} else {
		callback({'code': 2001, 'desc': errorDesc['2001']});
	}
}

/* Exports modules */
exports.fileParser = fileParser;
// fileParser('./file.dat', 4);