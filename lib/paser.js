var dataGisol = require('./dataGisol.js');

function dataPaser (string, serie, separator, callback) {
	if(string.lastIndexOf(separator) === -1) {
		callback(new Error('String not include separator: <' + separator + '>.'));
	} else {
		switch(parseInt(serie)) {
			case 3000: {
				// call 3000 parser
				var data3000 = new dataGisol();
				var arrayDesc = ['time', 'record', 'direct', 'temp1', 'globale', 'temp2', 'diffus', 'temp3', 'infra-rouge', 'temp4'];
				var i = 0;
				string.split(separator).forEach(function (value) {
					data3000.set(arrayDesc[i], value);
					i++;
				});
				console.log(data3000.data);
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

dataPaser('"2012-04-05 11:12:00",212975,0,0,1.648,0,1.895,0,-0.247,0', 3000, ',');
