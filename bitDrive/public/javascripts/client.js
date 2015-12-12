 $(function(){

  $( document ).on( "click", '#newDir', function(e) {
                
    if ($('#lightbox').length > 0) { // #lightbox exists
        
        /*$('#content').html("<table class='inside_items'>\
                        <tr>\
                          <th>Directory name:</th>\
                          <td><input type='text' name='dirName' placeholder='Directory Name'></td>\
                        </tr>\
                        <tr>\
                          <td colspan=2 id='create'><button type='submit' class='green'>Create</button>\
                        </tr>\
                    </table>");
        */
        $('#lightbox').show();
    }
    else { //#lightbox does not exist - create and insert (runs 1st time only)
        var lightbox = 
        "<div id='lightbox' class='lightbox'>\
            <p>Click to close</p>\
            <div id='content'> \
                <form action='/createDir' method='post'>\
                  <table class='inside_items'>\
                    <tr>\
                      <th>Directory name:</th>\
                      <td><input type='text' name='dirName' placeholder='Directory Name'></td>\
                    </tr>\
                    <tr>\
                      <td colspan=2 id='create'><button type='submit' class='green'>Create</button>\
                    </tr>\
                  </table>\
                </form>\
            </div>\
        </div>";

        $('body').append(lightbox);
    }
    
    
    $('html, body').css({
        'overflow': 'hidden'
    });

  });

    
  $( document ).on( "click", "#lightbox", function(e) { //must use on(), as the lightbox element is inserted into the DOM
      if( e.target == this ) {
          $('#lightbox').hide();
          $('html, body').css({
          'overflow': 'auto',
          'height': 'auto'
          });
      }
      
  });

  $( document ).on( "dblclick", "td", function(e) { 
      console.log("CLICKED : "+ $(this).attr("name")+"  "+$(this).attr("type") );
      if($(this).attr("type") == 'dir'){
        window.location.replace("/home/"+$(this).attr("name"));
      }else if($(this).attr("type") == 'file'){
        var form = $('<form></form>').attr('action', "/download").attr('method', 'post');
        form.append($("<input></input>").attr('type', 'hidden').attr('name', "fileID").attr('value', $(this).attr("name")));
        form.appendTo('body').submit().remove();

        /*
        $.post("/download",
                  {"fileID" : $(this).attr("name")},
                function(data) {

                      console.log("-----SERVER-----");
                      console.log(data);
                      console.log("-----SERVER-----");
        });*/
      }
      
  });

    $.contextMenu({
            selector: '.editable', 
            callback: function(key, options) {
                //console.log(options);
                //var m = "clicked: " + key + " " + $(this).attr("name");
                //window.console && console.log(m) || alert(m); 
                if(key == 'edit'){
                  if($(this).attr("type") == 'dir'){
                    lightBoxEdit("directory",$(this).attr("oldName"),'/renameDir',$(this).attr("name"));
                  }else if($(this).attr("type") == 'file'){
                    lightBoxEdit("file",$(this).attr("oldName"),'/renamefile',$(this).attr("name"));
                  }
                }else if(key == 'delete'){
                  if($(this).attr("type") == 'dir'){
                    lightBoxDelete("directory",$(this).attr("oldName"),'/deleteDir',$(this).attr("name"));
                  }else if($(this).attr("type") == 'file'){
                    lightBoxDelete("file",$(this).attr("oldName"),'/deleteFile',$(this).attr("name"));
                  }
                }
            },
            items: {
                "edit": {name: "Rename", icon: "edit"},
                "delete": {name: "Delete", icon: "delete"}
            }
    });

  function lightBoxEdit(type,oldName,url,id){
    if ($('#lightboxEdit').length > 0) { // #lightbox exists
        $('#lightboxEdit').show();
    }
    else { //#lightbox does not exist - create and insert (runs 1st time only)
        var lightboxEdit = 
        "<div id='lightboxEdit' class='lightbox'>\
            <p>Click to close</p>\
            <div id='content'> \
                <form action='"+url+"' method='post'>\
                  <input type='hidden' name='"+type+"ID' value="+id+">\
                  <table class='inside_items'>\
                    <tr>\
                      <th>New "+type+" name:</th>\
                      <td><input type='text' name='"+type+"Name' placeholder='"+oldName+"'></td>\
                    </tr>\
                    <tr>\
                      <td colspan=2 id='create'><button type='submit' class='green'>Rename</button>\
                    </tr>\
                  </table>\
                </form>\
            </div>\
        </div>";

        $('body').append(lightboxEdit);
   }
  }

  $( document ).on( "click", "#lightboxEdit", function(e) { //must use on(), as the lightbox element is inserted into the DOM
    if( e.target == this ) {
        $('#lightboxEdit').hide();
        $('html, body').css({
        'overflow': 'auto',
        'height': 'auto'
        });
    }
    
  });

    function lightBoxDelete(type,oldName,url,id){
    if ($('#lightBoxDelete').length > 0) { // #lightbox exists
        $('#lightBoxDelete').show();
    }
    else { //#lightbox does not exist - create and insert (runs 1st time only)
        var lightBoxDelete = 
        "<div id='lightBoxDelete' class='lightbox'>\
            <p>Click to close</p>\
            <div id='content'> \
                <form action='"+url+"' method='post'>\
                  <input type='hidden' name='"+type+"ID' value="+id+">\
                  <table class='inside_items'>\
                    <tr>\
                      <th style='text-align:center;'>Are you sure you want to delete "+type+" '"+oldName+"'</th>\
                    </tr>\
                    <tr>\
                      <td id='create'><button type='submit' class='red'>Delete</button>\
                    </tr>\
                  </table>\
                </form>\
            </div>\
        </div>";

        $('body').append(lightBoxDelete);
   }
  }

  $( document ).on( "click", "#lightBoxDelete", function(e) { //must use on(), as the lightbox element is inserted into the DOM
    if( e.target == this ) {
        $('#lightBoxDelete').hide();
        $('html, body').css({
        'overflow': 'auto',
        'height': 'auto'
        });
    }
    
  });




 });