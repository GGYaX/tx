var fp = require('../lib/fileParser.js');
var fs = require('fs');
var lazy = require('lazy');

var filename = 'somedata.dat';
var fp1 = new fp.fileParser(filename, 4);

var fparray = [];

// configure file
try {
	var globalConf = JSON.parse(fs.readFileSync('../config/config.json'));
} catch(err) {
	console.log(err);
	console.log("Can't start, configuration file can't be loaded.");
	process.exit(-1);
}

function writeinto(filename, data) {
	// this function will replace the filename with data
	if(fs.existsSync(filename)) {
		fs.writeFile(filename, data, null, function(err) {
			if(err) {
				return false;
			} else {
				return true;
			}
		});
	} else {
		return false;
	}
}

fs.readdir(globalConf.fileReader.path, function(err, files) {
	if(err) {
		console.log("Can't start, path doesn't exist.");
		process.exit(-1);
	} else {
		console.log(files);
		files.forEach(function(file) {
			if(file.indexOf('.dat') > -1) {
				var i = checkFileInMyArray(globalConf.fileReader.files, file);
				console.log(i);
				if(i !== undefined) {
					var filename = file;
					console.log(globalConf.fileReader.files);
					var readFrom = globalConf.fileReader.files[i].readFrom;
					console.log('' + globalConf.fileReader.path + filename);
					fparray.push(new fp.fileParser('' + globalConf.fileReader.path + '/' + filename, readFrom));
				} else {
					var filename = file;
					var readFrom = globalConf.fileReader.defaultReadFrom;
					fparray.push(new fp.fileParser('' + globalConf.fileReader.path + '/' + filename, readFrom));
				}
			}
		});
		for(var i = 0; i < fparray.length; i ++) {
			beginWatchFile(i);
		}
	}
});

function checkFileInMyArray(array, filename) {
	for(var i = 0; i < array.length; i++) {
		if(array[i].name === filename) {
			return i;
		}
	}
	return undefined;
}

function beginWatchFile(i) {
	fs.watchFile(fparray[i].filename, function(curr, prev) {
		if(curr.mtime.getTime() == prev.mtime.getTime()) {
			// console.log("no change");
			// nochange
		} else {
			fparray[i].begin(function(err) {
				if(err) {
					console.log(err);
				}
			});
		}
	});
}

setInterval(function() {
	fparray.forEach(function(fp) {
		console.log(fp.filename + 'has read : ' + fp.lineReaded);
	});
}, 2000);

