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
        "<div id='lightbox'>\
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

 });