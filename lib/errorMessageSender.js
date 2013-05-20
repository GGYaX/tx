var email = require('emailjs');
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
	server.send({
		'from': from,
		'to': to,
		'cc': cc,
		'subject': subject,
		'text': text
	}, function(err, message) {
		if(err) {
			callback({'code': 2003, 'desc': errorDesc['2003'] + '. Detail: ' + err})
		} else {
			callback(undefined, message);
		}
	});
}

function errorMessage() {
	this.message = [];
}

errorMessage.prototype.addMessage = function(errorCode, data) {
	this.message.push({'errorCode': errorCode, 'data': data, 'desc': errorMessage[errorCode]});
};


/* Export module */
exports.emailEntry = emailEntry;
