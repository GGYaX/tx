var fp = require('../lib/fileParser.js');
var fs = require('fs');
var lazy = require('lazy');

var filename = './somedata.dat';
var fp1 = new fp.fileParser(filename, 4);

fs.watchFile(filename, function(curr, prev) {
	if(curr.mtime.getTime() == prev.mtime.getTime()) {
  	console.log("no change");
  } else {
  	fp1.begin(function(err) {
			if(err) {
				console.log(err);
			}
		});
  }
});

setInterval(function() {
	console.log(fp1.lineReaded);
}, 1000);

