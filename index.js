var express = require('express');
var socket = require('socket.io');
var fs = require('fs');
var app = express();
app.set('port', 5000);
app.use(express.static(__dirname + '/public'));
global.applist;
global.includelists = [];
global.inclen = 0;
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//Serving setup files
var server = app.listen(app.get('port'), function () {
	console.log('Node app is running on port', app.get('port'));
});
//Socket Setup
var io = socket(server);
module.exports.express = app;
module.exports.io = io;
module.exports.server = server;
//Root Functions
function server_files() {
	// gets the files which require to be included stored in application.json
	fs.readFile('./public/applications/applications.json', 'utf8', function (err, data) {
		global.applist = JSON.parse(data);
		for (var i = 0; i < global.applist.length; i++) {
			if (global.applist[i].server_file) {
				global.applist[i].server_file = __dirname + global.applist[i].server_file;
				global.includelists[inclen] = require(global.applist[i].server_file);
				inclen++;
			}
		}
	});
}
//Default Route Function
app.get('/', function (req, res) {
	server_files();
	res.render('image');
});
io.on('connection', function (socket) {
	socket.emit('apps', global.applist);
	socket.on('get_file', function (data) {
		var path = __dirname + data.path;
		var id = data.id;

		fs.readFile(path, 'utf8', function (err, data) {
			socket.emit('res_file_' + id, data);
		});

	});
});