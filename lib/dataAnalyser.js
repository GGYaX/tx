


function analyser(dataGisol, callback) {
	try {
		this.conf = JSON.parse(fs.readFileSync('../config/testconf.json'));
	} catch(err) {
		console.log(err);
		console.log("Can't start, test configuration file can't be loaded.");
		process.exit(-1);
	}
	this.iglobal = dataGisol.data['global'];
	this.idiff = dataGisol.data['diffus'];
	this.idirect = dataGisol.data['direct'];
	this.errors = [];

	// this.errors.push('sdfsdf');

}

// analyser.prototype.a = function() {
	// this.errors.push('push');
// }

/* iglobal = idirect + idiff(avec seuil) */
function baseTest(dataGisol, callback) {
	// initialize
	if(typeof(arguments[0]) != 'function') {
		var iglobal = dataGisol.data['global'];
		var idiff = dataGisol.data['diffus'];
		var idirect = dataGisol.data['direct'];
		var callback = arguments[0];
	} else {
		var iglobal = this.iglobal
		var idiff = this.idiff;
		var idirect = this.idirect;
	}

	var ie = parseFloat(this.conf.ie.value);
	var seuil = parseFloat(this.conf.ie.seuil);

	var v = idirect + idiff;
	if(iglobal > v * (1 + seuil) && iglobal < v * (1 + seuil)) {
		callback({code: 3001, data: dataGisol});
	} else {
		callback(undefined);
	}
}

function irradiance_data_test(dataGisol, callback) {
	if(typeof(arguments[0]) != 'function') {
		var iglobal = dataGisol.data['global'];
		var idiff = dataGisol.data['diffus'];
		var idirect = dataGisol.data['direct'];
		var callback = arguments[0];
	} else {
		var iglobal = this.iglobal
		var idiff = this.idiff;
		var idirect = this.idirect;
	}


}

function horizontal_diffuse(dataGisol, callback) {

}

function 


analyser.prototype.baseTest = baseTest;
analyser.prototype.irradiance_data_test = irradiance_data_test;
analyser.prototype.horizontal_diffuse = horizontal_diffuse;