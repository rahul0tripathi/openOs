var app = require('../../../index.js');
var socket = require('socket.io');
var shell = require('shelljs')
var pty = require('node-pty');
var ansi2html = require('ansi2html');
const fs = require('fs');
const path = require('path');
/* 
app parameter holds two objects ::
	express : it is the express app running on default port
			USAGE :: app.express.get('route');
	socket : It is the socket polling on Default port
			USAGE :: app.io.on('connection');
*/
var terminals = {},
  logs = {};
app.express.get('/dummy_route', function (res, req) {
  console.log('Yep! Its Working');
});
var term = pty.spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', [], {
  name: 'xterm',
  cols: 80,
  rows: 24,
  cwd: process.env.PWD,
  env: process.env
});
terminals[term.pid] = term;
logs[term.pid] = '';


app.io.on('connection', function (socket) {
  global.object_id = 0;

  var term = terminals[Object.keys(terminals)[0]];
  socket.emit('shell_exec_response', 'Connected to terminal ' + term.pid);
  socket.emit('shell_exec_response', logs[term.pid]);

  socket.on('shell_exec', function (data) {

    global.object_id = data.id;

    term.write(data.sc + '\r');


  });
  socket.on('edit_file', function (filedata) {
       var file = path.resolve(__dirname,filedata.name);

   /*  if (fs.existsSync( './'+filedata.name))
    {*/
         fs.writeFile(file,filedata.fdata, 'utf-8', function (err) {
      if (err) {
          socket.emit('edit_file_response_'+filedata.name+filedata.id,"Failed To Save");
      } else {
         socket.emit('edit_file_response_'+filedata.name+filedata.id,"File Saved");
      }
    });
         /*
}else{
    socket.emit('edit_file_response_'+filedata.name+filedata.id,"File Not Found");
}*/
});
socket.on('view_file', function (filedata) {
     var file = path.resolve(__dirname,filedata.name);
   console.log(file);
  /*       if (fs.existsSync( './'+filedata.name ))
    { */

         fs.readFile(filedata.name,'Utf-8',function (err,data) {
        
      if (err) {
        socket.emit('view_file_response_'+filedata.name+filedata.id,"Failed To Open File");
      } else {

     socket.emit('view_file_response_'+filedata.name+filedata.id,data);
      }
    });
/*}else{
  socket.emit('view_file_response_'+filedata.name+filedata.id,"File Not Found");
}*/
});
  term.on('data', function (data) {
    console.log(logs[term.pid]);
    logs[term.pid] = data.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    data = data.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    socket.emit('shell_exec_response_' + global.object_id, data);
  });
});