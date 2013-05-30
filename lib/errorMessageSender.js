var email = require('emailjs');
var fs = require('fs');
// var server = email.server.connect({
// 	// user: "gongyanx",
// 	// password:"ICRhfy87",
// 	// host: "smtps.utc.fr",
// 	// // port: 587,
// 	// ssl: true

// 	user: "yanxin.gong22",
// 	password:"403768324",
// 	host: "smtp.gmail.com",
// 	ssl: true
// });

// server.send({
//    text:    "i hope this works", 
//    from:    "you <yanxin.gong22@gmail.com>", 
//    to:      "someone <yanxin.gong22@gmail.com>",
//    subject: "testing emailjs"
// }, function(err, message) { console.log(err || message); });

/* configure file loader */
try {
	var errorDesc = JSON.parse(fs.readFileSync('../config/errorDesc.json'));
} catch(err) {
	console.log(err);
	console.log("Can't start, error description file can't be loaded.");
	process.exit(-1);
}

/* Functions */

function emailEntry(from, to, cc, subject, text, callback) {
	try {
		var emailConf = JSON.parse(fs.readFileSync('../config/emailconf.json'));
	} catch(err) {
		callback({'code': 2002, 'desc': errorDesc['2002']}, undefined);
	}
	var server = email.server.connect({
		user: emailConf['user'],
		password: emailConf['password'],
		host: emailConf['host'],
		smtp: emailConf['smtp'],
		ssl: emailConf['ssl']
	});
	this.callback = callback;
	this.message = [];
	var that = this;
	// define sender
	this.send = function() {
		text += "\n\n";
		for(var i = 0; i < that.message.length; i ++) {
			text += '\n' + that.message[i]['desc'] + ' -> OriginData is: ' + that.message[i]['originData'];
		}
		var footer = "\n\n-------------------------------------\nAutomatiquement envoyé par le programme.";
		server.send({
			'from': from,
			'to': to,
			'cc': cc,
			'subject': subject,
			'text': text += footer
		}, function(err, message) {
			if(err) {
				that.callback({'code': 2003, 'detail': err});
			} else {
				that.callback(undefined, message);
			}
		});
	}
}

emailEntry.prototype.addMessage = function(errorCode, data) {
	this.message.push({'errorCode': errorCode, 'originData': data, 'desc': errorDesc[errorCode]});
};


/* Export module */
exports.emailEntry = emailEntry;
