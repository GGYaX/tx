/**
 * Dependencies :
**/
var fs = require('fs');
var lazy = require('lazy');
var dataGisol = require('./dataGisol.js');
var dataParser = require('./parser.js').dataParser;
var Events = require('events');
var dataTransformer = require('./parser.js').dataTransformer;
var path = require('path');
var analyser = require('./dataAnalyser.js').analyser;
var errorMessageSender = require('./errorMessageSender.js').emailEntry;

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

/** depandencies functions */
function newEventsWithOneListener(onWhat, myFunction) {
	var event = new Events.EventEmitter();
	event.on(onWhat, myFunction);
	return event;
}

function writeinto(filename, data) {
	// this function will replace the filename with data
	if(fs.existsSync(filename)) {
		if(data !== undefined && data !== '') {
			fs.writeFile(filename, data, null, function(err) {
				if(err) {
					console.log(err);
					return false;
				} else {
					return true;
				}
			});
		}
	} else {
		return false;
	}
}

// filename with fullpath
function fileParser(filename, position) {
	this.lineReaded = position;
	this.filename = filename;
	this.howmanyReaded = 0;
	this.lineReadedSinceLastTime = 0;
	this.errors = [];
	// this.analyser = new Analyser();
	var that = this;
	this.needtoWriteInto = newEventsWithOneListener('gogogo', function() {
		// i suppose we don't have 2 ou more writes into the config file at same time.
		console.log(globalConf.fileReader.files);
		for(var i = 0; i < globalConf.fileReader.files.length; i++) {
			if(globalConf.fileReader.files[i]['name'] === path.basename(filename)) {
				globalConf.fileReader.files[i]['readFrom'] = that.lineReaded;
				break;
			}
		}
		// begin to write into the conf file
		// if lineReadedSinceLastTime < checkErreurInterval, pull the trigger to check if need to send email
		if(that.lineReadedSinceLastTime < globalConf['checkErreurInterval']) {
			that.needtoCheck.emit('error', null);
		}
		that.lineReadedSinceLastTime = 0;
		writeinto('../config/config.json', JSON.stringify(globalConf, null, 2));
	});
	this.needtoCheck = newEventsWithOneListener('error', function(err) {
		// this.errors.push(err);
		if(that.errors.length >= globalConf['acceptErreurRatio'] * (that.lineReadedSinceLastTime * 2)) { 
		// if(that.errors.length >= 0) { 
			// need to send email
			// function emailEntry(from, to, cc, subject, text, callback) {
			console.log(87);
			var sender = new errorMessageSender('notify-dataGisol <noti@dataGisol.com>', 'yanxin.gong22@gmail.com', null, 'Gisol Data Errors', 'Bonjour Yanxin', function(err) {
				if(err) {
					console.log('email err');
				}
			});
			for(var i = 0; i < that.errors.length; i ++) {
				sender.addMessage(that.errors[i]['code'], that.errors[i]['originData']);
			}
			sender.send();
		}
	});
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
				that.howmanyReaded ++;
				that.lineReadedSinceLastTime ++;

				if(that.lineReadedSinceLastTime >= globalConf['checkErreurInterval']) {
					that.needtoCheck.emit('error', null); // each interval check if need to send email
					that.lineReadedSinceLastTime = 0;
				}

				console.log(that.lineReaded);
				// console.log(line);
				dataParser(line.toString(), 3000, ',', globalConf['tablePrefix']['3000'], function(err, data, originData) {
					that.howmanyReaded --;
					if(err) {
						console.log(err);
						that.errors.push(err);
					} else {
						dataTransformer(data, 3000);
						console.log(data);
						
						/* Begin the test */
						var a1 = new analyser(data);
						var error_baseTest = a1.baseTest();
						// var error_shadowband = analyser.shadowbandTest();
						/* If test has a error, push into test entry(analyse.error.push('errDescription')) */
						if(error_baseTest) {
							error_baseTest['originData'] = originData;
							that.errors.push(error_baseTest);
							console.log(that.errors);
						}
						// if(error_shadowband) {
						// 	console.log('baseTest error');
						// 	error_shadowband['originData'] = originData;
						// 	that.errors.push(error_shadowband);
						// }
						/* test finised */
						
						// var time, date;
						// time = data.time.value.split(' ')[1];
						// date = data.time.value.split(' ')[0];
					}
					if(that.howmanyReaded === 0) {
						that.needtoWriteInto.emit('gogogo', null);
					}
				});
			});
	} else {
		callback({'code': 2001});
	}
}


/* Exports modules */
exports.fileParser = fileParser;
// fileParser('./file.dat', 4);