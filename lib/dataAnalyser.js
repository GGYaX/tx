/**
 * Dependencies :
**/
var fs = require('fs');

function analyser(dataGisolTransformed, testconf) {
	this.conf = testconf;
	this.iglobal = dataGisolTransformed['globale']['value'];
	this.idiff = dataGisolTransformed['diffus']['value'];
	this.idirect = dataGisolTransformed['direct']['value'];
	this.time = dataGisolTransformed['time']['value'].toString().replace(/-/g, '/').replace(/"/g, '');
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
	if(iglobal > v * (1 + seuil) || iglobal < v * (1 - seuil) || iglobal < 0 || iglobal > 1.2 * ie || idiff < 0 || idiff > 0.8 * ie) {
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
		var time = dataGisolTransformed['time']['value'].toString();
	} else {
		var iglobal = this.iglobal
		var idiff = this.idiff;
		var idirect = this.idirect;
		var time = this.time;
	}

	var ie = parseFloat(this.conf.ie.value);
	var seuil = parseFloat(this.conf.ie.seuil);

	var date = TimeTransfer(time, 'yyyy/mm/dd');
	var r = idirect * sinSOLALT(date.year,date.month,date.day,date.hour,date.minute,date.second);
	if((iglobal - idiff) > r * (1 + seuil) || (iglobal - idiff) < r * (1 - seuil)) {
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
		var GHA = (15 * UT - 180 - C + L - alpha)%360;
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

function TimeTransfer( dat, datetype){

	var d2 = new Date();	//date d¨¦but de l'ann¨¦e
	//Parameters 
	var stmlong=2.3265;
	var tdiff=120; //time diff greenwich-minutes
	var longitude=2.823056; 

	switch(datetype)
	{
		case "mm/dd/yyyy":
		var d1=new Date(dat);
		break;
		
		case "dd/mm/yyyy":
		var d1=new Date( dat.replace( /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/, "$2/$1/$3  $4:$5:$6") );	
		break;

		case "yyyy/mm/dd":
		var d1=new Date( dat.replace( /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/, "$2/$3/$1  $4:$5:$6") );	
		break;
	}

	console.log('herer' + d1.toString());

	Year =d1.getFullYear();
	Month=d1.getMonth();
	Day=d1.getDate();
	Hour=d1.getHours();
	Minute=d1.getMinutes();
	Seconde=d1.getSeconds();


	d2.setYear(Year);
	d2.setMonth(0);
	d2.setDate(1);
	d2.setHours(0);
	d2.setMinutes(0);
	d2.setSeconds(0);

	var gap=d1-d2;
	var nday= Math.ceil(gap/(24*60*60*1000)); //nth day of the year
	var datec= (nday-1)*360/365;
	//minc :eq. of time in minutes-Duffie&Beckman 3es p.11-1.5.3
	var minc=229.2*(0.000075+0.001868* Math.cos(datec)-0.032077* Math.sin(datec)-0.014615*Math.cos(2*datec)-0.04089*Math.sin(2*datec));
	var corr = -tdiff + 4*(stmlong-longitude) + minc;

	// var y = year, m = month, D = day, h = hour, min = minute, second = s;

	var r = {};
	r.year = Year;
	r.month = Month;
	r.day = nday;
	r.hour = Hour;
	r.minute = Minute;
	r.second = Seconde;

	// console.log(nday);
	// console.log(d1);
	// console.log(d2);
	// console.log(datec);
	// console.log(minc);
	// console.log(corr);
	// console.log(Hour);
	// console.log(Minute);

	// return d1;
	return r;
};


/* Exports modules */
exports.analyser = analyser;