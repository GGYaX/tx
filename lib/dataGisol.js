/* Functions */
function dataGisol (){
	this.data = {};
}

dataGisol.prototype.get = function (key, callback){
	if(this.data[key]) {
		callback(undefined, this.data[key]);
	} else {
		callback(new Error('No field in this data.'));
	}
};
dataGisol.prototype.set = function (key, value) {
	this.data[key] = value;
};

/* Export module */
module.exports = dataGisol;