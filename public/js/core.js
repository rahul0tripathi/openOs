$("#fullscreen").click(function () {
      document.fullScreenElement && null !== document.fullScreenElement || !document.mozFullScreen && !document.webkitIsFullScreen ?
        document.documentElement.requestFullScreen ? document.documentElement.requestFullScreen() : document.documentElement
        .mozRequestFullScreen ? document.documentElement.mozRequestFullScreen() : document.documentElement.webkitRequestFullScreen &&
        document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT) : document.cancelFullScreen ?
        document.cancelFullScreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitCancelFullScreen &&
        document.webkitCancelFullScreen()
    });

    var socket = io();

var k =0 ;
    socket.on('apps', function (data) {
      if(k <1){
      k++;
      var apps = data;
      var column = 1;
      var row = 1;
      $(".application").append('<div class="row" id="row_' + row + '" style="width:100%;">');
      localStorage.setItem('apps', apps);
      for (var i = 0; i < apps.length; i++) {
$(".Dock").append('<div class="Icon app" id="' + apps[i]
          .name + '" path="' + apps[i].entry_file + '"><img src ="' + apps[i].icon +
          '" style="height:45px; width:45px; margin-left:10px;"></div)');
      $("#row_" + row).append('<div draggable="true"  style="color:white;" class="col s12 m2 app"  id="' + apps[i]
          .name + '" path="' + apps[i].entry_file + '"><img src ="' + apps[i].icon +
          '" style="height:54px; width:54px; margin-left:10px;"><br><a style="color:white;  margin-left:12px;">' +
          apps[i].name + '</a></div>');
        if (column == 6) {
          row++;
          $(".application").append('</div><div class="col s12 row" id="row_' + row + '" >');

        }
        if (i == apps.length - 1) {
          $(".application").append('</div>');
        }
        column++;
      }
      $('.app').draggable();
      $(".app").dblclick(function () {
        var req_id = Math.floor(Math.random() * 100)
        var req = {
          id: req_id,
          path: $(this).attr('path')
        }
        socket.emit('get_file', req);
        socket.on('res_file_' + req_id, function (data) {

          $("#appframe").html(data);
          console.log($(this).attr('id'));
          //$("#navbar_list").appned('<li><a><img src ="'+apps[$(this).attr('id')].icon+'" style="height:30px; width:30px; vertical-align:middle;">'+apps[$(this).attr('id')].name+'</a></li>');
        });

      });
    }
    });