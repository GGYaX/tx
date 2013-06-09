var fs = require('fs');
var nodemailer = require('nodemailer');


/* Functions */

function emailEntry(errorDesc, emailConf, callback) {
	var emailConf = emailConf;
	this.errorDesc = errorDesc;
	this.callback = callback;
	this.message = [];
	this.text = "";
	var that = this;

	this.mailText = function() {
		var header = emailConf['header']+ "\n\n";
		var footer = '\n\n' + emailConf['footer'];
		for(var i = 0; i < that.message.length; i ++) {
			that.text += '\n' + that.message[i]['desc'] + ' -> OriginData is: ' + that.message[i]['originData'];
		}
		return header + that.text  + footer;
	}
	// define sender
	this.send = function() {
		// create a mail sender
		var transport = nodemailer.createTransport("SMTP", {
	    host: emailConf['host'] || 'localhost', // hostname
	    secureConnection: emailConf['ssl'] || false, // use SSL
	    port: emailConf['port'] || 465, // port for secure SMTP
	    auth: {
	    	user: emailConf['user'],
	    	pass: emailConf['password']
	    }
	  });

		var mailOptions = {
	    // from: "Fred Foo ✔ <yanxin.gong22@gmail.com>", // sender address
	    from: "emailConf['from']", // sender address
	    to: emailConf['to'], // list of receivers
	    subject: "Data Gisol info", // Subject line
	    text: that.mailText(), // plaintext body
	    // html: "<b>Hello world nodemail test</b>" // html body
	  };

	  transport.sendMail(mailOptions, function(error, response) {
	  	if(error){
	  		that.callback({'code': 2003, 'detail': error});
	  	} else {
	  		console.log("Message sent: " + response.message + '\n');
	  	}
	    transport.close(); // shut down the connection pool, no more messages
	  });
	}
}

emailEntry.prototype.addMessage = function(errorCode, data) {
	this.message.push({'errorCode': errorCode, 'originData': data, 'desc': this.errorDesc[errorCode]});
};


/* Export module */
exports.emailEntry = emailEntry;
