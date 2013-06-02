/**
 * Dependencies :
**/
var fs = require('fs');

function analyser(dataGisolTransformed, testconf) {
	this.conf = testconf;
	this.iglobal = dataGisolTransformed['globale']['value'];
	this.idiff = dataGisolTransformed['diffus']['value'];
	this.idirect = dataGisolTransformed['direct']['value'];
	// this.errors = [];

	// this.errors.push('sdfsdf');

}

// analyser.prototype.a = function() {
	// this.errors.push('push');
// }

/* iglobal = idirect + idiff(avec seuil) */
function baseTest(dataGisolTransformed) {
	// initialize
	if(arguments.length === 1) {
		var iglobal = dataGisolTransformed['globale']['value'];
		var idiff = dataGisolTransformed['diffus']['value'];
		var idirect = dataGisolTransformed['direct']['value'];
		var callback = arguments[0];
	} else {
		var iglobal = this.iglobal
		var idiff = this.idiff;
		var idirect = this.idirect;
	}

	var ie = parseFloat(this.conf.ie.value);
	var seuil = parseFloat(this.conf.seuil);

	var v = idirect + idiff;
	console.log('v is: ' + v);
	console.log('idirect is: ' + idirect);
	console.log('idiff is: ' + idiff);
	console.log('iglobal is: ' + iglobal);
	if(iglobal > v * (1 + seuil) || iglobal < v * (1 - seuil)) {
		return {code: 3001};
	} else {
		return undefined;
	}
}

function shadowbandTest(dataGisolTransformed, callback) {
	// initialize
	if(arguments.length === 1) {
		var iglobal = dataGisolTransformed['globale']['value'];
		var idiff = dataGisolTransformed['diffus']['value'];
		var idirect = dataGisolTransformed['direct']['value'];
		var callback = arguments[0];
	} else {
		var iglobal = this.iglobal
		var idiff = this.idiff;
		var idirect = this.idirect;
	}

	var ie = parseFloat(this.conf.ie.value);
	var seuil = parseFloat(this.conf.ie.seuil);

	var r = idirect * sinSOLALT(1,1,1,1,1,1);
	if((iglobal - idiff) > r * (1 + seuil) || (iglobal - idiff) < v * (1 - seuil)) {
		return {code: 3002}
	} else {
		return undefined;
	}
}

function sinSOLALT(year, month, day, hour, minute, second) {
	try {
		var LAT = 49.4149;
		var y = year, m = month, D = day, h = hour, min = minute, second = s;
		var UT = h + (min / 60) + (s / 3600);
		if(m > 2) {
			y = y;
			m = m - 3;
		} else {
			y = y - 1;
			m = m + 9;
		}
		var t = ((UT/24) + D + parseInt(30.6 * m + 0.5) + parseInt(365.25 * (y - 1976)) - 8707.5) / 365.25
		var G = 357.528 + 35999.05 * t;
		var C = 1.915 * Math.sin(G) + 0.020 * Math.sin(2 * G);
		var L = 280.460 + 36000.770 * t + C;
		var alpha = L - 2.466 * Math.sin(2 * L) + 0.053 * Math.sin(4 * L);
		var GHA = 15 * UT - 180 - C + L - alpha;
		var e = 23.4393 - 0.013 * t;
		var DEC = 1 / (Math.tan(Math.tan(e) * Math.sin(alpha)));
	} catch(err) {
		return err;
	}
	return Math.sin(LAT) * Math.sin(DEC) - Math.cos(LAT) * Math.cos(DEC) * Math.cos(GHA);
}

/* prototype */
analyser.prototype.baseTest = baseTest;
analyser.prototype.shadowbandTest = shadowbandTest;

/* Exports modules */
exports.analyser = analyser;