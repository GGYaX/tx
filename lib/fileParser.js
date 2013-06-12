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

try {
	var testConf = JSON.parse(fs.readFileSync('../config/testconf.json'));
} catch(err) {
	console.log(err);
	console.log("Can't start, test configuration file can't be loaded.");
	process.exit(-1);
}

try {
	var errorDesc = JSON.parse(fs.readFileSync('../config/errorDesc.json'));
} catch(err) {
	console.log(err);
	console.log("Can't start, error description file can't be loaded.");
	process.exit(-1);
}

try {
	var emailconf = JSON.parse(fs.readFileSync('../config/emailconf.json'));
} catch(err) {
	console.log(err);
	console.log("Can't start, email config file can't be loaded.");
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
					console.log(err + '\n');
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
	this.lineReadedSinceLastPush = 0;
	this.errorParser = [[]];
	this.errorBaseTest = [[]];
	this.errorShadowBand = [[]];
	this.nbtestParser = 0;
	this.nbtestBT = 0;
	this.nbtestSB = 0;
	this.whichInterval = 0;
	// this.analyser = new Analyser();
	var that = this;
	this.needtoWriteInto = function() {
		// i suppose we don't have 2 ou more writes into the config file at same time.
		for(var i = 0; i < globalConf.fileReader.files.length; i++) {
			if(globalConf.fileReader.files[i]['name'] === path.basename(filename)) {
				globalConf.fileReader.files[i]['readFrom'] = that.lineReaded;
				break;
			}
		}
		// begin to write into the conf file
		// if lineReadedSinceLastPush < checkErreurInterval, pull the trigger to check if need to send email
		writeinto('../config/config.json', JSON.stringify(globalConf, null, 2));
	}
	this.needtoCheck = function() {
		that.needtoWriteInto();
		// this.errors.push(err);
		needtosend = false;
		try {
			var sender = new errorMessageSender(errorDesc, emailconf, function(err) {
				if(err) {
					throw(err);
				}
			});
		} catch (err) {
			console.log(err);
		}

		// pour chaque interval des données, vérifie si cet interval est passé le ration des erreurs
		that.errorParser.forEach(function(error) {
			if(that.nbtestParser !== 0 && error.length >= globalConf['acceptErreurRatio'] * ((that.nbtestParser >= globalConf['checkErreurInterval']) ? globalConf['checkErreurInterval'] : that.nbtestParser)) {  // pour erreur de parser
				needtosend = true;
				// need to send email
				// function emailEntry(from, to, cc, subject, text, callback) {
				for(var i = 0; i < error.length; i ++) {
					sender.addMessage(error[i]['code'], error[i]['originData']);
				}
				if(that.nbtestParser > globalConf['checkErreurInterval']) that.nbtestParser -= globalConf['checkErreurInterval'];
			}
		});
		// pour chaque interval des données, vérifie si cet interval est passé le ration des erreurs
		that.errorBaseTest.forEach(function(error) {
			if(that.nbtestBT !== 0 && error.length >= globalConf['acceptErreurRatio'] * ((that.nbtestBT >= globalConf['checkErreurInterval']) ? globalConf['checkErreurInterval'] : that.nbtestBT)) {  // pour erreur de basetest
				needtosend = true;
				// need to send email
				// function emailEntry(from, to, cc, subject, text, callback) {
				for(var i = 0; i < error.length; i ++) {
					sender.addMessage(error[i]['code'], error[i]['originData']);
				}
				if(that.nbtestBT > globalConf['checkErreurInterval']) that.nbtestBT -= globalConf['checkErreurInterval'];
			}
		});

		that.errorShadowBand.forEach(function(error) {
			if(that.nbtestSB !== 0 && error.length >= globalConf['acceptErreurRatio'] * ((that.nbtestSB >= globalConf['checkErreurInterval']) ? globalConf['checkErreurInterval'] : that.nbtestSB)) {  // pour erreur de shadowband
				needtosend = true;
				// need to send email
				// function emailEntry(from, to, cc, subject, text, callback) {
				for(var i = 0; i < error.length; i ++) {
					sender.addMessage(error[i]['code'], error[i]['originData'], this.filename);
				}
				if(that.nbtestSB > globalConf['checkErreurInterval']) that.nbtestSB -= globalConf['checkErreurInterval'];
			}
		});
		that.errorParser = [[]];
		that.errorBaseTest = [[]];
		that.errorShadowBand = [[]];
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

		// cet setInterval detecte toutes les 3 seconds pour voir si le programme fini de lire un fichier
		setInterval(function() {
			if(checklineReaded != that.lineReaded) {
				checklineReaded = that.lineReaded;
			} else if(that.whichInterval != 0 || that.lineReadedSinceLastPush != 0) { // needtoCheck
				that.needtoCheck(); // each interval check if need to send email
				that.lineReadedSinceLastPush = 0;
				that.whichInterval = 0;
			}
		}, globalConf['ticker']);

		// create lazy
		new lazy(stream)
			.lines
			.skip(that.lineReaded) // skip the 4 first lines
			.forEach(function(line) {
				// call parser to parse 
				// console.log(line.toString());
				that.lineReaded ++;
				that.lineReadedSinceLastPush ++;

				if(that.lineReadedSinceLastPush > globalConf['checkErreurInterval']) {
					// that.needtoCheck(); // each interval check if need to send email
					that.whichInterval ++;
					that.errorParser.push([]);
					that.errorBaseTest.push([]);
					that.errorShadowBand.push([]);
					that.lineReadedSinceLastPush -= globalConf['checkErreurInterval'];
				}

				// console.log(line);
				dataParser(line.toString(), 3000, ',', globalConf['tablePrefix']['3000'], function(err, data, originData) {
					that.nbtestParser ++;
					if(err) {
						console.log(err);
						that.errorParser[that.whichInterval].push(err);
					} else {
						dataTransformer(data, 3000);
						
						/* Begin the test */
						var a1 = new analyser(data, testConf);
						var error_baseTest = a1.baseTest(); that.nbtestBT ++;
						var error_shadowband = a1.shadowbandTest(); that.nbtestSB ++;
						/* If test has a error, push into test entry(analyse.error.push('errDescription')) */
						if(error_baseTest) {
							error_baseTest['originData'] = originData;
							that.errorBaseTest[that.whichInterval].push(error_baseTest);
							// console.log(that.errorBaseTest);
						}
						if(error_shadowband) {
							error_shadowband['originData'] = originData;
							that.errorShadowBand[that.whichInterval].push(error_shadowband);
						}
						/* test finised */
						
						// var time, date;
						// time = data.time.value.split(' ')[1];
						// date = data.time.value.split(' ')[0];
					}
					// that.needtoWriteInto();
				});
			});
	} else {
		callback({'code': 2001});
	}
}


/* Exports modules */
exports.fileParser = fileParser;
// fileParser('./file.dat', 4);