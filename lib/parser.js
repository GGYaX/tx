/**
 * Dependencies :
**/
var fs = require('fs');

var dataGisol = require('./dataGisol.js');

try {
	var globalConf = JSON.parse(fs.readFileSync('../config/config.json'));
} catch(err) {
	console.log(err);
	console.log("Can't start, configuration file can't be loaded.");
	process.exit(-1);
}

/* Functions */
function dataParser (string, serie, separator, tablePrefix, callback) {
	if(string.lastIndexOf(separator) === -1) {
		callback(new Error('String not include separator: <' + separator + '>.'));
	} else {
		switch(parseInt(serie)) {
			case 3000: {
				// call 3000 parser
				var data3000 = new dataGisol();
				// var arrayDesc3000 = ['time', 'record', 'direct', 'temp1', 'globale', 'temp2', 'diffus', 'temp3', 'infra-rouge', 'temp4'];
				// var arrayUnit3000 = ['TS', 'RN', 'mV', 'mV', 'mV', 'mV', 'mV', 'mV', 'mV', 'mV'];
				// var arrayType3000 = ["","","Avg","Avg","Avg","Avg","Avg","Avg","Avg","Avg"];
				var arrayDesc = tablePrefix['arrayDesc'];
				var arrayUnit = tablePrefix['arrayUnit'];
				var arrayType = tablePrefix['arrayType'];

				var i = 0;
				stringSplitted = string.split(separator);
				if(stringSplitted.length != arrayDesc.length) {
					callback({'code': 1001, 'originData': string}, undefined);
				}
				stringSplitted.forEach(function (r) {
					var value = {};
					if(r === '' || /^ /i.test(r)) {
						callback({'code': 3001, 'originData': string}, undefined);
					} else {
						if(parseFloat(r) === 0 || parseFloat(r)) {
							// this is a float but not the time string
							value['value'] = parseFloat(r);
						} else {
							value['value'] = r;
						}
						value['unit'] = arrayUnit[i];
						data3000.set(arrayDesc[i], value);
						i++;
					}
				});
				callback(undefined, data3000.data, string);
			} break;
			case 1000: {
				// call 1000 parser
			} break;
			default: {
				callback(new Error('Serie number not support for analyse.'));
			} break;
		}
	}
}
// dataParser('"2012-04-05 11:12:00",212975,0,0,1.648,0,1.895,0,-0.247,0', 3000, ',');

function dataTransformer(dataGisol, serie) {
	// switch(serie)
	dataGisol['direct'].value = parseFloat((dataGisol['direct'].value / 0.00807).toFixed(globalConf['dataPrecision']));
	dataGisol['direct'].unit = 'w';
	dataGisol['globale'].value = parseFloat((dataGisol['globale'].value / 0.00808).toFixed(globalConf['dataPrecision']));
	dataGisol['globale'].unit = 'w';
	dataGisol['diffus'].value = parseFloat((dataGisol['diffus'].value / 0.00912).toFixed(globalConf['dataPrecision']));
	dataGisol['diffus'].unit = 'w';
	dataGisol['infra-rouge'].value = parseFloat((dataGisol['infra-rouge'].value / 0.00762).toFixed(globalConf['dataPrecision']));
	dataGisol['infra-rouge'].unit = 'w';
}

/* Export module */
exports.dataParser = dataParser;
exports.dataTransformer = dataTransformer;