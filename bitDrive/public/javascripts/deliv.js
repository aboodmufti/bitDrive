 $(function(){
  var table = $("#destinationTable")
  var id = 3 

  $( document ).on( "click", '#addAddr', function(e) {
    var newRow = `<tr>
                    <td class="small">Next Destination:</td>
                    <td class="big">
                      <input type="text" class="big" id="autocomplete${id}"/>
                      <button type="button" class="small red removeAddr" >X</button>
                    </td>
                  </tr>`
    table.append(newRow);
    newAutocomplete(id)
    id++
  });

  $( document ).on( "click", '.removeAddr', function(e) {
    var row = $(this).parent().parent()
    row.remove();
  });

  $( document ).on( "click", '#clear', function(e) {
    $("#results").empty()
  });

  $( document ).on( "click", '#submit', function(e) {
    $("#results").empty()
    var rows = table.children('tbody').children('tr');
    var minutes = $(rows[0]).find("input")[0].value
    var addresses = []
    
    for (var i = 1; i < rows.length; i++) {
      addresses.push($(rows[i]).find("input")[0].value)
    };
    
    $.post("/bestRoute", {arr: addresses, time: minutes}, function(result){
      $("#results").append("<p>")
      for (var i = 0; i < result.length; i++) {
        var route = result[i]
        $("#results").append(`---------------------------------------<br>
          <table>
          <tr><td><b>From:</b> </td><td>${route.origin}</td></tr>
          <tr><td><b>Destination ${i+1}:</b> </td><td>${route.destination}</td></tr>
          <tr><td><b>Maximum Departure Time:</b> </td><td>${route.worst_departure_time}</td></tr>
          <tr><td><b>Best Arrival Time:</b> </td><td>${route.best_arrival_time}</td></tr>
          <tr><td><b>Worst Arrival Time:</b> </td><td>${route.worst_arrival_time}</td></tr>
          </table>`)
      }
      $("#results").append("</p>")
      $("#results").append('<button type="button" id="clear" class="small red">Clear Results</button>')
    });
  });

  

 });

 function newAutocomplete(id){
  var str = 'autocomplete'+id
    console.log(str)
    auto = new google.maps.places.Autocomplete(document.getElementById(str))

 }
 function initAutocomplete() {
        // Create the autocomplete object, restricting the search to geographical
        // location types.
        autocomplete = new google.maps.places.Autocomplete((document.getElementById('autocomplete')));
        autocomplete2 = new google.maps.places.Autocomplete((document.getElementById('autocomplete2')));
  }