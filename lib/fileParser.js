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
	this.lineReadedSinceLastSendMail = 0;
	this.errorParser = [];
	this.errorBaseTest = [];
	this.errorShadowBand = [];
	this.nbtestParser = 0;
	this.nbtestBT = 0;
	this.nbtestSB = 0;
	this.testPased = 0;
	// this.analyser = new Analyser();
	var that = this;
	this.needtoWriteInto = function() {
		// i suppose we don't have 2 ou more writes into the config file at same time.
		console.log(globalConf.fileReader.files);
		for(var i = 0; i < globalConf.fileReader.files.length; i++) {
			if(globalConf.fileReader.files[i]['name'] === path.basename(filename)) {
				globalConf.fileReader.files[i]['readFrom'] = that.lineReaded;
				break;
			}
		}
		// begin to write into the conf file
		// if lineReadedSinceLastSendMail < checkErreurInterval, pull the trigger to check if need to send email
		that.testPased = 0;
		writeinto('../config/config.json', JSON.stringify(globalConf, null, 2));
	}
	this.needtoCheck = function() {
		// this.errors.push(err);
		needtosend = false;
		try {
			var sender = new errorMessageSender(function(err) {
				if(err) {
					throw(err);
				}
			});
		} catch (err) {
			console.log(err);
		}
		console.log('that.nbtestParser is: ' + that.nbtestParser);
		console.log('that.nbtestBT is: ' + that.nbtestBT);
		console.log('that.nbtestSB is: ' + that.nbtestSB);
		if(that.errorParser.length >= globalConf['acceptErreurRatio'] * that.nbtestParser && that.nbtestParser !== 0) {  // pour erreur de parser
			needtosend = true;
			// need to send email
			// function emailEntry(from, to, cc, subject, text, callback) {
			console.log(106);
			for(var i = 0; i < that.errorParser.length; i ++) {
				sender.addMessage(that.errorParser[i]['code'], that.errorParser[i]['originData']);
			}
		}
		if(that.errorBaseTest.length >= globalConf['acceptErreurRatio'] * that.nbtestBT && that.nbtestBT !== 0) {  // pour erreur de basetest
			needtosend = true;
			// need to send email
			// function emailEntry(from, to, cc, subject, text, callback) {
			console.log(114);
			for(var i = 0; i < that.errorBaseTest.length; i ++) {
				sender.addMessage(that.errorBaseTest[i]['code'], that.errorBaseTest[i]['originData']);
			}
		}
		if(that.errorShadowBand.length >= globalConf['acceptErreurRatio'] * that.nbtestSB && that.nbtestSB !== 0) {  // pour erreur de shadowband
			needtosend = true;
			// need to send email
			// function emailEntry(from, to, cc, subject, text, callback) {
			console.log(123);
			for(var i = 0; i < that.errorShadowBand.length; i ++) {
				sender.addMessage(that.errorShadowBand[i]['code'], that.errorShadowBand[i]['originData']);
			}
		}
		that.errorParser = [];
		that.errorBaseTest = [];
		that.errorShadowBand = [];
		that.nbtestParser = 0;
		that.nbtestBT = 0;
		that.nbtestSB = 0;
		if(needtosend === true) sender.send();
		needtosend = false;
	}
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
		var checklineReaded = 0;

		setInterval(function() {
			console.log(152);
			if(checklineReaded != that.lineReaded) {
				checklineReaded = that.lineReaded;
			} else if(that.lineReadedSinceLastSendMail !== 0){ // needtoCheck
				that.needtoCheck(); // each interval check if need to send email
				that.lineReadedSinceLastSendMail = 0;
			}
		}, 3000);

		// create lazy
		new lazy(stream)
			.lines
			.skip(that.lineReaded) // skip the 4 first lines
			.forEach(function(line) {
				// call parser to parse 
				// console.log(line.toString());
				that.lineReaded ++;
				that.lineReadedSinceLastSendMail ++;

				if(that.lineReadedSinceLastSendMail >= globalConf['checkErreurInterval']) {
					that.needtoCheck(); // each interval check if need to send email
					that.lineReadedSinceLastSendMail -= globalConf['checkErreurInterval'];
				}

				console.log(that.lineReaded);
				// console.log(line);
				dataParser(line.toString(), 3000, ',', globalConf['tablePrefix']['3000'], function(err, data, originData) {
					that.nbtestParser ++;
					if(err) {
						console.log(err);
						that.errorParser.push(err);
					} else {
						dataTransformer(data, 3000);
						console.log(data);
						
						/* Begin the test */
						var a1 = new analyser(data);
						var error_baseTest = a1.baseTest();
						that.nbtestBT ++;
						// var error_shadowband = analyser.shadowbandTest(); that.nbtestSB ++;
						/* If test has a error, push into test entry(analyse.error.push('errDescription')) */
						if(error_baseTest) {
							error_baseTest['originData'] = originData;
							that.errorBaseTest.push(error_baseTest);
							console.log(that.errorBaseTest);
						}
						// if(error_shadowband) {
						// 	console.log('baseTest error');
						// 	error_shadowband['originData'] = originData;
						// 	that.errorShadowBand.push(error_shadowband);
						// }
						/* test finised */
						
						// var time, date;
						// time = data.time.value.split(' ')[1];
						// date = data.time.value.split(' ')[0];
					}
					that.needtoWriteInto();
				});
			});
	} else {
		callback({'code': 2001});
	}
}


/* Exports modules */
exports.fileParser = fileParser;
// fileParser('./file.dat', 4);