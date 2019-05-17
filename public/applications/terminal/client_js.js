var i = 1;
var commands = [];
var commands_index = 0;
var color_library = ['#06f3b5', '#e91e63', '#00bcd4', '#cecccc'];
var socket = io();
socket.on('shell_exec_response', function (data) {
    $("#exec").append('<p>')
    data = data.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

    for (i = 0; i < data.length; i++) {

        if (data[i] != '\n') {
            $("#exec").append(data[i])
        } else if (data[i] == '\n') {
            $("#exec").append('<br>')
        } else {
            $("#exec").append(' ')
        }
    }


    $("#loader").hide(10, function () {
        $("#input_line").show();
    });
});
$('#input_line').on('keydown', function (e) {
    var times = 0;
    var script = $(this).val().replace('$', '').replace('>', '').replace(" ", '');
    if (e.which == 38) {
        times++;

        $(this).val(">$ " + commands[commands_index - times]);

    } else if (e.which == 13) {
        e.preventDefault();
        commands[commands_index] = script;
        commands_index++;
        if (script == "clear") {
            $("#exec").html("");
            $(this).val(">$ ");
            i = 1;
        }
        else if(script.indexOf("sudo")>=0 || script.indexOf("rm")>=0 ||script.indexOf("reboot")>=0||script.indexOf("shutdown")>=0){
             $("#exec").append('<p>' + i + '.<font color="#ff071a">> $ </font>' + script +" : Not allowed </p>");
        } 
        else if(script.substring(0, 4) == 'edit'||script.substring(0, 3) == 'vim'||script.substring(0, 4) == 'code'){
                             $(this).val(">$ ");       var filename = script.substring(5, script.length);
                                        var random = Math.floor(Math.random() * 1000);
                                       socket.emit('view_file', {
                                      name: filename,
                                        id:random
                                    })
                                    socket.on('view_file_response_' + filename+ random,function(data) {
                                   
                                      if(data.substring(0, 4) != "File"){
                                        $("#shell").hide();
                                        $("#editor-area").show();
                                       $("#editor-area").append('<div id="editor"><div class="navbar-fixed" style="background-color:#090300; font-size:12px; "> <nav style="background-color:transparent; color:white;"><div class="nav-wrapper"><ul><li><i id="save" class="material-icons">save</i></li><li><i id="cancel" class="material-icons">cancel</i></li></ul></div></nav></div><textarea id="editbox"  ></textarea></div>');
                                       var textArea = document.getElementById('editbox');
                                          var filetype = script.substring(script.indexOf(".")+1,script.length);
                                         if(filetype != 'js'){
                                     var editor = CodeMirror.fromTextArea(textArea,{
                                        mode:"htmlmixed",
                                        theme:"3024-night",
                                        lineNumbers: true,
                                        scrollbarStyle:"null"
                                        });
                  }
                  else{
                    var editor = CodeMirror.fromTextArea(textArea,{
                                        mode:"javascript",
                                        theme:"monokai",
                                        lineNumbers: true,
                                        scrollbarStyle:"null"
                                        });
                  }
                                      editor.getDoc().setValue(data);
                                      
                                      $("#cancel").click(function(){
                                   $("#editor-area").hide();
                                      $("#editor").remove();
                                      $("#exec").append('<p> WARNING! Operation Aborted By The user </p>');
                                     $("#shell").show();
                                  });
                                      $("#save").click(function(){
                                         var random = Math.floor(Math.random() * 1000);
                                           socket.emit('edit_file', {
                                        fdata:editor.getValue(),
                                        name: script.substring(5, script.length),
                                        id:random
                                    });
                                            socket.on('edit_file_response_' + script.substring(5, script.length)+ random,function(data) {
                                                $("#editor-area").hide();
                                                $("#editor").remove();
                                                $("#exec").append('<p>'+script.substring(5, script.length)+' : '+data+' </p>');
                                                 $("#shell").show();
                                            });
                                      });}
                                      else{
                                        $("#exec").append('<p>'+data+'</p>');
                                      }
                                    });
                                }
        else {
            $(this).val(">$ ");

            $("#input_line").hide(10, function () {
                $("#loader").show();

                var random = Math.floor(Math.random() * 1000);
                socket.emit('shell_exec', {
                    sc: script,
                    id: random
                });
                $("#exec").append('<p>' + i + '.<font color="#ff071a">> $ </font>' + script + '<br><output id=' + random + '></output></p>');
                i++;
                socket.on('shell_exec_response_' + random, function (data) {

                    if (script.substring(0, 3) == 'top') {
                        $("#" + random).html('');

                        $("#" + random).css('color', '#10de52');
                    } else {
                        var color = Math.floor(Math.random() * (4));
                        console.log(color);
                        $("#" + random).css('color', color_library[color]);
                    }
                    data = data.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

                    for (i = 0; i < data.length; i++) {

                        if (data[i] != '\n') {
                            $("#" + random).append(data[i])
                        } else if (data[i] == '\n') {
                            $("#" + random).append('<br>')
                        } else {
                            $("#" + random).append(' ')
                        }
                    }


                    $("#loader").hide(10, function () {
                        $("#input_line").show();
                    });
                });
            });
        }
    }
    /*
    else */
});
$('#input_line_big').on('keydown', function (e) {
    var script = $(this).val().replace('$', '').replace('>', '').replace(" ", '');
    if (e.which == 13) {
        e.preventDefault();
        commands[commands_index] = JSON.stringify(script);
        commands_index++
        if (script == "clear") {
            $("#exec_big").html("");
            $(this).val(">$ ");
            i = 1;
        }    else if(script.indexOf("sudo")>=0 || script.indexOf("rm")>=0 ||script.indexOf("reboot")>=0||script.indexOf("shutdown")>=0){
             $("#exec_big").append('<p>' + i + '.<font color="#ff071a">> $ </font>' + script +" : Not allowed </p>");
        }        else if(script.substring(0, 4) == 'edit'||script.substring(0, 3) == 'vim'||script.substring(0, 4) == 'code'){
                                 $(this).val(">$ ");   var filename = script.substring(5, script.length);
                                        var random = Math.floor(Math.random() * 1000);
                                       socket.emit('view_file', {
                                      name: filename,
                                        id:random
                                    })
                                    socket.on('view_file_response_' + filename+ random,function(data) {
                                   
                                      if(data.substring(0, 4) != "File"){
                                        $("#shell_big").hide();
                                        $("#editor-area-big").show();
                                       $("#editor-area-big").append('<div id="editor_big" style="height: 100vh;"><div class="navbar-fixed" style="background-color:#090300; "> <nav style="background-color:transparent; color:white;"><div class="nav-wrapper"><ul><li><i id="save" class="material-icons">save</i></li><li><i id="cancel" class="material-icons">cancel</i></li></ul></div></nav></div><textarea id="editbox_big"  ></textarea></div>');
                                       var textArea = document.getElementById('editbox_big');
                                          var filetype = script.substring(script.indexOf(".")+1,script.length);
                                         if(filetype != 'js'){
                                     var editor = CodeMirror.fromTextArea(textArea,{
                                        mode:"htmlmixed",
                                        theme:"3024-night",
                                        lineNumbers: true,
                                        scrollbarStyle:"null"
                                        });
                  }
                  else{
                    var editor = CodeMirror.fromTextArea(textArea,{
                                        mode:"javascript",
                                        theme:"monokai",
                                        lineNumbers: true,
                                        scrollbarStyle:"null"
                                        });
                  }
                                      editor.getDoc().setValue(data);
                                      
                                      $("#cancel").click(function(){
                                   $("#editor-area-big").hide();
                                      $("#editor_big").remove();
                                      $("#exec_big").append('<p> WARNING! Operation Aborted By The user </p>');
                                     $("#shell_big").show();
                                  });
                                      $("#save").click(function(){
                                         var random = Math.floor(Math.random() * 1000);
                                           socket.emit('edit_file', {
                                        fdata:editor.getValue(),
                                        name: script.substring(5, script.length),
                                        id:random
                                    });
                                            socket.on('edit_file_response_' + script.substring(5, script.length)+ random,function(data) {
                                                $("#editor-area-big").hide();
                                                $("#editor_big").remove();
                                                $("#exec_big").append('<p>'+script.substring(5, script.length)+' : '+data+' </p>');
                                                 $("#shell_big").show();
                                            });
                                      });}
                                      else{
                                        $("#exec_big").append('<p>'+data+'</p>');
                                      }
                                    });
                                }else {
            $(this).val(">$ ");

            $("#input_line_big").hide(10, function () {
                $("#loader_big").show();

                var random = Math.floor(Math.random() * 1000);
                socket.emit('shell_exec', {
                    sc: script,
                    id: random
                });
                $("#exec_big").append('<p>' + i + '.<font color="#ff071a">> $ </font> ' + script + '<br><output id=' + random + '></output></p>');
                i++;
                socket.on('shell_exec_response_' + random, function (data) {

                    if (script.substring(0, 3) == 'top') {
                        $("#" + random).html('');

                        $("#" + random).css('color', '#10de52');
                    } else {
                        var color = Math.floor(Math.random() * (4));
                        console.log(color);
                        $("#" + random).css('color', color_library[color]);
                    }
                    data = data.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

                    for (i = 0; i < data.length; i++) {

                        if (data[i] != '\n') {
                            $("#" + random).append(data[i])
                        } else if (data[i] == '\n') {
                            $("#" + random).append('<br>')
                        } else {
                            $("#" + random).append(' ')
                        }
                    }


                    $("#loader_big").hide(10, function () {
                        $("#input_line_big").show();
                    });
                });
            });
        }
    }
});