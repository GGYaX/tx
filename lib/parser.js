var dataGisol = require('./dataGisol.js');

try {
	var errorDesc = JSON.parse(fs.readFileSync('../config/errorDesc.json'));
} catch(err) {
	console.log(err);
	console.log("Can't start, error description file can't be loaded.");
	process.exit(-1);
}

/* Functions */
function dataParser (string, serie, separator, callback) {
	if(string.lastIndexOf(separator) === -1) {
		callback(new Error('String not include separator: <' + separator + '>.'));
	} else {
		switch(parseInt(serie)) {
			case 3000: {
				// call 3000 parser
				var data3000 = new dataGisol();
				var arrayDesc3000 = ['time', 'record', 'direct', 'temp1', 'globale', 'temp2', 'diffus', 'temp3', 'infra-rouge', 'temp4'];
				var arrayUnit3000 = ['TS', 'RN', 'mV', 'mV', 'mV', 'mV', 'mV', 'mV', 'mV', 'mV'];
				var i = 0;
				stringSplitted = string.split(separator);
				if(stringSplitted.length != arrayDesc3000.length) {
					callback({'code': 1001, 'desc': errorDesc['1001']}, undefined);
				}
				stringSplitted.forEach(function (r) {
					var value = {};
					if(/ */g.test(r)) {
						callback({'code': 1002, 'desc': errorDesc['1002']}, undefined);
					} else {
						if(parseFloat(r) === 0 || parseFloat(r)) {
							// this is a float but not the time string
							value['value'] = parseFloat(r);
						} else {
							value['value'] = r;
						}
						value['unit'] = arrayUnit3000[i];
						data3000.set(arrayDesc3000[i], value);
						i++;
					}
				});

				callback(undefined, data3000.data);
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

/* Export module */
module.exports = dataParser;