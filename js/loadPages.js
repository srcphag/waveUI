//INDEX
function indexPage() {
    $.when( getUser() ).done(function(user) { 
        
        var userName = user.data[0].username; 
        $('.user li:eq(0)').html(userName);
        
        $('.user li:eq(2)').click(function(){
            $.ajax({
                type: "GET",
                timeout: 30000,
                url: 'https://accounts.admira.com/login/close?access_token=' + localStorage.getItem('token') + '&client_id='+client_sso_id + '&redirect_uri='+callback + '&response_type=code&scope=account.profile',
                xhrFields: {
                    withCredentials: true
                },
                success: function(data){
                    console.log(data);
                    localStorage.clear();
                    location.reload();
                    console.log("logout");
                }
            });    
        });             
        
     })
}

//seciones principales del nav
function playerList(){
    // if ( $("#info_area").hasClass("showInfo"))
    //     hideInfo();
    // $('#spinner').css("display", "flex");
    // var d_Main = $.Deferred();
    // $('#infoPag').html("Player List");
    // $('.nav ').removeClass("active");
    // $('.players.nav ').addClass("active");
    // $( "nav" ).removeClass( "visible" ); 


    $.when( getPlayers(), getSummary(), d_Main ).done(function(players, summary) {
        
        players = players[0];
        summary = summary[0];
        
            if (players.data && players.data.length > 0) {
                orderObj.players = players.data; //Pasamos al objeto orderObj los datos obtenidos de los players
                $.each(players.data, function( index , player ) {
                                
                    var strList='<a href="#player-page"><li data-id="'+player.id+'" data-name="'+player.name+'">'+
                        '<div class="img"><span></span></div>'+
                        '<div>'+
                            '<h3><span>Music Player</span>'+player.name+'</h3>'+ 
                        '</div>'+
                        '</li></a>';    
                    $("#player").append(strList);                                                          
                }); 
                $.each(summary.data, function( index, emission ) {
                    var strEmission='<li>'+
                                           '<div>'+emission.count+'</div>'+
                                           '<div>@status</div>'+
                                   '</li>';                                                                                 
                       switch(emission.status) {
                           case 0:
                               strEmission = strEmission.replace("@status", "Active");
                               break;
                           case 1:
                               strEmission = strEmission.replace("@status", "Disconnected");
                               break;
                           case 2:
                               strEmission = strEmission.replace("@status", "Stopped");
                               break;
                       }                

                       $("#status").append(strEmission);
                   }); 
                // $("#player a li").click(function(){
                //     idPlayer = $(this).data("id");
                //     namePlayer = $(this).data("name");
                //     localStorage.setItem('idPlayer', idPlayer);
                //     localStorage.setItem('namePlayer', namePlayer);
                // });
                $("#player").contextMenu({
                    selector: 'li', 
                    callback: function(key, options) {
                        idPlayer = options.$trigger.data("id");
                        localStorage.setItem('idPlayer', idPlayer);
                        namePlayer = options.$trigger.data("name");
                        localStorage.setItem('namePlayer', namePlayer);
                        if(key=="open"){
                            checkToken(function(done){
                                if(done){ 
                                    window.location.hash = '#player-page';
                                } 
                            });        
                        }

                        if(key=="edit"){
                            checkToken(function(done){
                                if(done){ 
                                    playerInfoAreaPage();
                                } 
                            });  
                        }
                        if(key=="delete"){
                            $( "#modalDeletePlayer" ).dialog( "open" );
                        }
                    },
                    items: {
                        "open": {name: "Open"}, 
                        "edit": {name: "Edit"},   
                        "delete": {name: "Delete"},
                    }
                });
            }
            //funcion para el obtener el source del autocomplete buscador de players
            loadPlayerSearch();
            $('#spinner').css("display", "");
            var strTabs =
                '<li><button class="tablink active">schedules</button></li>'+
                '<li><button class="tablink">albums</button></li>';
            $(".tabs").html(strTabs);
            tabs($('button:contains("schedules")'), 'schedules');
            $(".tabs").addClass("active");
          });
    
   
    //  $( "main" ).load( "http://"+ window.location.host+"/newadmira-music/route/player-list/player-list.html", function() { d_Main.resolve(); });


}

function albumList() {
    if ( $("#info_area").hasClass("showInfo")) hideInfo();
    $('#spinner').css("display", "flex");
   
    var d_Main = $.Deferred();
    $('#infoPag').html("Album List");
    $('.nav ').removeClass("active");
    $('.albums.nav ').addClass("active");
    $( "nav" ).removeClass( "visible" ); 

    $.when( getAlbumsBlock(), d_Main ).done(function(albums) {
        albums = albums[0];
        if (albums.data.length>0){
            orderObj.albums = albums.data; //Pasamos al objeto orderObj los datos obtenidos de los albums
            $("#album").html("");    
            albums.data.sort(function(a, b) {
                var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }

                // names must be equal
                return 0;
                });
            $.each(albums.data, function( index, album ) {
                //alert( index + ": " + value );
                // sort by name

                var strList='<a href="#album-page"><li data-id="'+album.id+'" data-name="'+album.name+'">'+
                            '<div class="img"><span></span></div>'+
                            '<div>'+
                                '<h3><span>Album</span>'+album.name+'</h3>'+ 
                            '</div>'+
                        '</li></a>';    
                $("#album").append(strList);                                                          
            }); 
                                                                                   
            // $("#album a li").click(function(){
            //     idAlbum = $(this).data("id");
            //     nameAlbum = $(this).data("name");
            //     localStorage.setItem('idAlbum', idAlbum);
            //     localStorage.setItem('nameAlbum', nameAlbum);
            // });
            $("#album").contextMenu({
                    selector: 'li', 
                    callback: function(key, options) {
                        idAlbum = options.$trigger.data("id");
                        nameAlbum = options.$trigger.data("name");
                        localStorage.setItem('idAlbum', idAlbum);
                        localStorage.setItem('nameAlbum', nameAlbum);
                        if(key=="open"){
                            checkToken(function(done){
                                if(done){ 
                                    window.location.hash = '#album-page';
                                } 
                            });
                        }
                        if(key=="assign"){         
                            getPlvforAssingPlayer().done(function(result){
                                $( "#modalAssignAlbum" ).dialog( "open" );
                            });
                        }
                        if(key=="edit"){
                            checkToken(function(done){
                                if(done){ 
                                    albumInfoAreaPage();
                                } 
                            });
                        }
                        if(key=="delete"){
                            $( "#modalDelete" ).dialog( "open" );
                            console.log("delete"); 
                        }
                    },
                    items: {
                        "open": {name: "Open"}, 
                        "assign": {name: "Assign"},
                        "edit": {name: "Edit"},   
                        "delete": {name: "Delete"},
                    }
                });
        }
        //funcion para el obtener el source del autocomplete buscador de albumns 
        loadAlbumsSearch();
       
        //llamamos a la funcion para que los inpunts tenga tooltip que muestre contador de caracteres restantes.
        chargeTyppyInput();
     

        $('#spinner').css("display", "");
        var strTabs =
            '<li><button class="tablink active">tracks</button></li>'+
            '<li><button disabled class="tablink"></button></li>';
         $(".tabs").html(strTabs);
        tabs($('button:contains("tracks")'), 'tracks');
        $(".tabs").addClass("active");
    });

    $( "main" ).load( "http://"+ window.location.host+"/newadmira-music/route/album-list/album-list.html", function() { d_Main.resolve(); });
}

function scheduleList() {
    
    if ( $("#info_area").hasClass("showInfo")) hideInfo();
    $('#spinner').css("display", "flex");
   
    var d_Main = $.Deferred();
   
    $.when( d_Main ).done(function() {
        $('#infoPag').html("Schedule List");
        $('#spinner').css("display", "");
        var strTabs =
        '<li><button class="tablink active">albums</button></li>'+
        '<li><button disabled class="tablink"></button></li>';
        $(".tabs").html(strTabs);
        tabs($('button:contains("albums")'), 'albums');   
        });
        $(".tabs").addClass("active");
        $( "nav" ).removeClass( "visible" ); 

    $( "main" ).load( "http://"+ window.location.host+"/newadmira-music/route/schedule-list/schedule-list.html", function() { d_Main.resolve(); });
    
}


// paginas individuales
function playerPage() {
    $('#spinner').css("display", "flex");
    var d_Main = $.Deferred();
    var d_Info = $.Deferred();
    $('#infoPag').html("Player Detail");
    $('.nav ').removeClass("active");
    $('.players.nav ').addClass("active");
    $( "nav" ).removeClass( "visible" ); 

    $.when(getPlayer(), getInfoPlayer(), d_Main, d_Info).done(function(player, player_info) {
        
        player= player[0];
        player_info = player_info[0];

        $('#player-page h1').html(namePlayer);
        $('#player-info li:eq(0)').append(player.data[0].name);
        $('#player-info li:eq(0)').append(player_info.data[0].so);
        $('#player-info li:eq(1)').append(player.data[0].apiKey);
        $('#player-info li:eq(2)').append(player_info.data[0].plvIp);
        $("#player-info form input:eq(0)").attr("placeholder", player.data[0].name);
        $("#player-info form input:eq(1)").attr("placeholder", player_info.data[0].location);
        $('#plv_timezone option').each(function() {
            //console.log($(this).val());
            if ($(this).val() === player_info.data[0].timezone){
                $(this).prop("selected", true);
                return;
            }
         
        });
        $('#plv_timezone').selectric();
        $("#player-info form textarea").attr("placeholder", player_info.data[0].description);

        //area para arrastrar y asignar album o schedule
        $( ".dropzone" ).droppable({
            accept: ".dragelement",

            over: function( event, ui ) {

                $(this).find('li').css('border','2px dashed #FFC054');
            },
            out: function( event, ui ) {
               $(this).find('li').css('border','#e6e6e6 dashed 2px');
            },  
            drop: function(event, ui) {

              if ($(ui.draggable).closest('.source').attr('id') === 'albums') {
                  $('.dropzone').addClass('assigned');
              }else{
                  alert("Añadir un estilo del color de un schedule");
              }
              $(this).find('li').css('border','');
            }
        });
        
        //Dropdow para con 5 dias desde la fecha actual, hacía atrás para cargar los emission log
        for (var i=0; i<5; i++)
            {
                $("#dataLogs").append($("<option />").val(i+1).text(moment().subtract(i, 'days').format('dddd - DD/MM/YYYY')));
            }
        
        $("#dataLogs").selectric({
            onChange: function() {
                alert($('option:selected',this).text());
            },
        });   

        var strTabs =
            '<li><button class="tablink active">schedules</button></li>'+
            '<li><button class="tablink">albums</button></li>';
        $(".tabs").html(strTabs);
        tabs($('button:contains("schedules")'), 'schedules');
        $(".tabs").addClass("active");       
        
        $('#spinner').css("display", "");
        showInfo();

    });
   
    $( "main" ).load( "http://"+ window.location.host+"/newadmira-music/route/player-page/player-page.html", function() { d_Main.resolve(); });
    
    //  $( "#info_area" ).load( "http://"+ window.location.host+"/newadmira-music/route/player-info/player-info.html", function(){ d_Info.resolve(); });
}

function albumPage() {
    $('#spinner').css("display", "flex");
    var d_Main = $.Deferred();
    var d_Info = $.Deferred();
    $('#infoPag').html("Album Detail");
    $('.nav ').removeClass("active");
    $('.albums.nav ').addClass("active");
    $( "nav" ).removeClass( "visible" ); 
    
    $.when(getAlbumBlock(), getSourceTracksBlock(), d_Main, d_Info).done(function(album, tracks) {

            album = album[0];
            tracks = tracks[0];
  
            //dos arrays para comparar si hay diferencía en la propiedades del álbum y la función que las compara
            var data = [album.data[0].name,album.data[0].description];
            var newData = [];
            
            function arrEvery(a1,a2) {    
                    return a1.every(function (v, i) {
                        return v === a2[i];
                    });
                }
            
            $('#album-page h1').html(nameAlbum);
            $('#album_description').html(album.data[0].description);
                $.each(tracks.data, function( index, track ) {
                    //alert( index + ": " + track );
                    console.log(track);
                    var strList='<li data-id="'+track.content.id+'" data-name="'+track.content.name+'" ><span>'+track.content.name+'</span> </li>';
                    $("#album-page ol").append(strList);
                });
            $('#album-info li:eq(0)').find('span').html(album.data[0].name);
            $('#album-info li:eq(1)').append(album.data[0].lastUpdate);
            $('#album-info li:eq(2)').append(tracks.data.length);
            $("#album-info form input").val(album.data[0].name);
            $("#album-info form textarea").val(album.data[0].description);
            $('#spinner').css("display", "");
            showInfo();
           
            $("#album-info button:eq(0)").on('click', function(e){
                e.preventDefault();
               
                    newData = [$.trim($('#titleAlbum').val()),$.trim($('#descAlbum').val())] 
                    if (!arrEvery(data, newData)) {
                        newData[2] = 0;
                        alert("cambio");
                        
                        modifyAlbum(newData[0],newData[1],newData[2])
                    }                
            })

            $("#album-info button:eq(1)").on('click', function(e){
                e.preventDefault();
                deleteAlbum();
            })

            $("#album-page ol").sortable({
                distance: 20,
                tolerance: "pointer",
                containment: $("#album-page ol").parent(),
                cursor: 'ns-resize',
                axis: 'y',
                start: function( event, ui ){
                    $(ui.item).parent().find('.ui-sortable-placeholder').hide();
                },
        
                update: function(event, ui) {
                    //aqui hay que hacer un put para cambiar el orden de los contenidos en la PlayList
                    
                    // $("#files_to_upload li").each(function(i) {
                    //     fileList[i] = fileInput.files[parseInt($(this).attr('data-pos'))];
                    // });
                    // console.log('After fileList ',fileList);
                }
            }); 
          $("#files_to_upload ul").disableSelection();
          fileInput = $('input#upload-input')[0];    
          dragToUpload();
          
            
         var strTabs =
                '<li><button class="tablink active">tracks</button></li>'+
                '<li><button class="tablink">albums</button></li>';
            $(".tabs").html(strTabs);
            tabs($('button:contains("tracks")'), 'tracks');
            $(".tabs").addClass("active");

         
    });
   
    $('main').load( "http://"+ window.location.host+"/newadmira-music/route/album-page/album-page.html", function() { d_Main.resolve(); });
    $( "#info_area" ).load( "http://"+ window.location.host+"/newadmira-music/route/album-info/album-info.html", function() { d_Info.resolve(); });
    
}

function schedulePage() {
    
    $('#spinner').css("display", "flex");
    var d_Main = $.Deferred();
    var d_Info = $.Deferred();

    $.when(d_Main, d_Info).done(function() {
        $('#infoPag').html("Schedule Detail");
        loadSchedule(); //funcion encargada del uso de fullcalendar
        $('#spinner').css("display", "");
        showInfo();
        var strTabs =
        '<li><button class="tablink active">albums</button></li>'+
        '<li><button class="tablink active">schedules</button></li>';
    $(".tabs").html(strTabs);
    tabs($('button:contains("albums")'), 'albums');
    $(".tabs").addClass("active");
    $( "nav" ).removeClass( "visible" ); 

    });
   
    $( "main" ).load( "http://"+ window.location.host+"/newadmira-music/route/schedule-page/schedule-page.html", function() { d_Main.resolve(); });
    $( "#info_area" ).load( "http://"+ window.location.host+"/newadmira-music/route/schedule-info/schedule-info.html", function() { d_Info.resolve(); });

    
}

function errorPage() {
    
    if ( $("#info_area").hasClass("showInfo")) hideInfo();
    $('#spinner').css("display", "flex");
    var d_Main = $.Deferred();
    $.when(d_Main).done(function() {
        $('#spinner').css("display", "");
    });
    $( "main" ).load( "http://"+ window.location.host+"/newadmira-music/route/error-page/error-page.html", function() { d_Main.resolve(); });    
}

//secciones indivuales info area
function trackInfoAreaPage() {
    hideInfo();
    $('#spinner').css("display", "flex");
    var d_Info = $.Deferred();
    $.when(getContent(), d_Info).done(function(content) {

        content = content[0];

            var extension = content.data[0].filename.slice((content.data[0].filename.lastIndexOf(".") - 1 >>> 0) + 2);

            $('#track-info li:eq(0)').html(content.data[0].title+"."+extension);
            $('#track-info li:eq(1)').append(extension.charAt(0).toUpperCase() + extension.slice(1));
            // $("#track-info form input").attr("placeholder", album.data[0].name);
            // $("#track-info form textarea").attr("placeholder", album.data[0].description);
            $('#downloadTrack').click(function(){
                
                
                $($("a[download]")[0]).trigger("click");
                    
            
            //       function onStartedDownload(id) {
            //         console.log(`Started downloading: ${id}`);
            //       }
                  
            //       function onFailed(error) {
            //         console.log(`Download failed: ${error}`);
            //       }
                  
            //       var downloadUrl = 'http://apilb.admira.com/videos/original/3514/'+idTrack+'/'+idTrack+'.mp3';
                  
            //       var browser = browser || chrome;
                  
            //       var downloading = browser.downloads.download({
            //         url : downloadUrl,
            //         //filename : 'my-image-again.png',
            //         conflictAction : 'uniquify'
            //       });
                  
            //       downloading.then(onStartedDownload, onFailed);
             })
            $('#spinner').css("display", "");
             showInfo();
             tabs($('button:contains("albums")'), 'albums');


          });
   
   
          $( "#info_area" ).load( "http://"+ window.location.host+"/newadmira-music/route/track-info/track-info.html", function() { d_Info.resolve(); });
}

function albumInfoAreaPage() {

    $('#spinner').css("display", "flex");
    var d_Info = $.Deferred();
    $.when(getAlbumBlock(), getSourceTracksBlock(), d_Info).done(function(album, tracks) {

       album = album[0];
       tracks = tracks[0];

       //dos arrays para comparar si hay diferencía en la propiedades del álbum y la función que las compara
       var data = [album.data[0].name,album.data[0].description];
       var newData = [];
     
       function arrEvery(a1,a2) {    
            return a1.every(function (v, i) {
                return v === a2[i];
            });
        }


            console.log(album)
            $('#album-info li:eq(0)').find('span').html(album.data[0].name);
            $('#album-info li:eq(1)').append(album.data[0].lastUpdate);
            $('#album-info li:eq(2)').append(tracks.data.length);
            $("#titleAlbum").val(album.data[0].name);
            $("#descAlbum").val(album.data[0].description);
             
            $('#spinner').css("display", "");
            showInfo();
            
            $("#album-info button:eq(0)").on('click', function(e){
                e.preventDefault();
               
                    newData = [$.trim($('#titleAlbum').val()),$.trim($('#descAlbum').val())] 
                    if (!arrEvery(data, newData)) {
                        newData[2] = 0;
                        alert("cambio");
                        
                        modifyAlbum(newData[0],newData[1],newData[2])
                    } 

            })

            $("#album-info button:eq(1)").on('click', function(e){
                e.preventDefault();
                deleteAlbum();
            })
            //llamamos a la funcion para que los inpunts tenga tooltip que muestre contador de caracteres restantes.
            chargeTyppyInput();
          });
   
   
    $( "#info_area" ).load( "http://"+ window.location.host+"/newadmira-music/route/album-info/album-info.html", function() { d_Info.resolve(); });

}

function playerInfoAreaPage() {
    
    $('#spinner').css("display", "flex");
    var d_Info = $.Deferred();
    $.when(getPlayer(), getInfoPlayer(), d_Info).done(function(player, player_info) {
        $('#player-page h1').html(namePlayer);
        $('#player-info li:eq(0)').html(player[0].data[0].name);
        $('#player-info li:eq(1)').append(player_info[0].data[0].so);
        $('#player-info li:eq(2)').append(player[0].data[0].apiKey);
        $('#player-info li:eq(3)').append(player_info[0].data[0].plvIp);
        $("#player-info form input:eq(0)").attr("placeholder", player[0].data[0].name);
        $("#player-info form input:eq(1)").attr("placeholder", player_info[0].data[0].location);
        $('#plv_timezone option').each(function() {
            //console.log($(this).val());
            if ($(this).val() === player_info[0].data[0].timezone){
                $(this).prop("selected", true);
                return;
            }
         
        });
        $('#plv_timezone').selectric();
        $("#player-info form textarea").attr("placeholder", player_info[0].data[0].description);

        $('#spinner').css("display", "");
        showInfo();
    });
   
    $( "#info_area" ).load( "http://"+ window.location.host+"/newadmira-music/route/player-info/player-info.html", function() { d_Info.resolve(); });
}

function sourceArea () {
    //  $('.grid-container').addClass('blur1'); // hay que hacer un addClass de .spiner y eliminarlo cuando cargue
    var d_SourceArea = $.Deferred();
    $.when(getAlbumsBlock(), d_SourceArea).done(function(albums) {
 
        $("#albums").html("");
        
        albums = albums[0];
        
        $.each(albums.data, function( index, album ) {
            //alert( index + ": " + value );
            var strList =
            '<div class="accordion">'+
                '<ul class="accordion-toggle" data-id="'+album.id+'" data-name="'+album.name+'">'+
                    '<div class="img"><span></span></div>'+
                    '<hl>'+album.name+'</hl>'+
                    '<div class="dragelement"></div>'+
               '</ul>'+
                    '<ol class="accordion-content" data-id="'+album.id+'">'+  
                    '</ol>'+
            '</div>';   
            $("#albums").append(strList);
        }); 

        $('.accordion').find('.accordion-toggle').click(function(e){
            e.preventDefault();
            if (accordionCanPush) {
                if($(this).next().css("display")=="none") {
                    accordionCanPush = false;   
                    var id_playlist=$(this).data("id");
                    console.log(id_playlist);
                    idAlbum = id_playlist;
                    localStorage.setItem('idAlbum', idAlbum);
                    nameAlbum = $(this).data("name");
                    localStorage.setItem('nameAlbum', nameAlbum);
                    var albumAccordion = $(this);
                    checkToken(function(done){
                        if(done){ 
                             getTracksForAccordion(albumAccordion);
                        }
                    });        
                    
                }else{
                    //Hide panels
                    $(this).next().stop().slideUp('slow');
    
                }
                $(".accordion-toggle").each(function(){
                    $(this).css('background-color','');
                })
                        
                // //Expand or collapse this panel
                // $(this).next().stop().slideToggle('slow');
    
                // //Hide the other panels
                $(".accordion-content").not($(this).next()).stop().slideUp('fast');
            }     
                             
        });
        $('#albums .dragelement').each(function() {
       
            // store data so the calendar knows to render an event upon drop
            $(this).data('event', {
              title: $.trim($(this).parent().text()), // use the element's text as the event title
              stick: true, // maintain when user navigates (see docs on the renderEvent method)
              idAD: $(this).parent().data("id")
            });
      
            // make the event draggable 
            $(this).draggable({
              zIndex: 9999,
              helper: function(){
                return $('<div class="drag-album"><span>'+$(this).parent().data("name")+'</span></div>');
              },
              start: function() {
                $('.dropzone').css({'background-color':'#fffcef', 'border':'#e6e6e6 dashed 2px'}); 
              },
              stop: function (){
                $('.dropzone').css({'background-color':'', 'border':''}); 
              },
            
              scroll: false,  
              appendTo: 'body',
                revert: 'true',
                opacity: "0.8",
                revertDuration: 200,
                
            });
           
      
          }); 

          
        $("#albums").contextMenu({
            selector: 'ul', 
            callback: function(key, options) {
                idAlbum = options.$trigger.data("id");
                localStorage.setItem('idAlbum', idAlbum);
                nameAlbum = options.$trigger.data("name");
                localStorage.setItem('nameAlbum', nameAlbum);
                if(key=="open"){
                    checkToken(function(done){
                        if(done){ 
                            if (window.location.hash !== "#album-page") {
                                window.location.hash = '#album-page';
                            }else{ // si ya estamos en #album-page, el no hará el evento hashchange, así que tenemos que llamar a la función
                                albumPage();   
                            }
                        } 
                    });        
                }
                if(key=="edit"){
                    checkToken(function(done){
                        if(done){ 
                            albumInfoAreaPage();
                        } 
                    });
                }
                if(key=="delete"){

                   deleteAlbum();
                   // $( "#modalDelete" ).dialog( "open" );
                    console.log("delete"); 
                }
            },
            items: {
                "open": {name: "Open"}, 
                "edit": {name: "Edit"},   
                "delete": {name: "Delete"},
            }
        });
     
    });    
   
    // $( "#source_area" ).load( "http://"+ window.location.host+"/newadmira-music/source-area.html", function() { d_SourceArea.resolve(); });

}


//funciones relacionadas con la carga de diferentes partes de la página

function getTracksForAccordion(album){
    console.log(album)
    
    $.when( getSourceTracksBlock() ).done(function(tracks) {

        $(".accordion-content[data-id='"+idAlbum+"']").html("");

        if (tracks.data.length>0){
              
                $.each(tracks.data, function( index, track ) {
                    //alert( index + ": " + track );
                    console.log(track);
                    var strList='<li data-id="'+track.content.id+'" data-name="'+track.content.name+'" ><span>'+track.content.name+'</span></li>';

                    $(".accordion-content[data-id='"+idAlbum+"']").append(strList);

                });
        }else{
            $(".accordion-content[data-id='"+idAlbum+"']").append("<div class='void'><div class='wrapper'><div class='error-img'></div><h4>Nothing here!</h4></div><p>This album it's empty</p><p><a href='#album-page'>Click here</a> to add music<p></div>");
        }
        
        //Controlamos acordeon de albumes en el source area
        //Expand  this panel
        album.next().stop().slideDown('slow', function(){
            album.css('background-color','rgba(61, 61, 61, 0.041)');   
            accordionCanPush = true;   
        });
        
        $(".void a").click (function(){
            // getInfoAlbum();
            // getSourceAlbum(id);
            checkToken(function(done){
                    if(done){ 
                        if (window.location.hash === "#album-page") // si ya estamos en #album-page, no hará el evento hashchange, así que tenemos que llamar a la función
                            albumPage();   
                    } 
                }); 

        });

        function deleteTrack(){
            var bodyHtml = '<div class="body">'+
                                '<p>Estás apunto de eliminar el track <b>'+nameTrack+'</b>. Esta acción no se podrá deshacer.</p>'
                            '</div>';
                            var headers = new Headers();
                                    headers.append('Content-Type', 'application/x-www-form-urlencoded');
                                    headers.append('Access-Control-Allow-Origin','*');
                                    headers.append('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
                                    headers.append('Access-Control-Allow-Headers','Content-Type');                
            swal({
                title: 'Are you sure?',
                html: bodyHtml,
                showLoaderOnConfirm: true,
                preConfirm: ( function () {
                    
                    return fetch( APIWEB_URL+"content/"+idTrack+"?access_token="+localStorage.getItem('access_token')+"&project_id=3514",{
                        crossDomain:true,
                        method: 'DELETE',
                        headers: headers
                    }).then(response => {
                        if (!response.ok) {
                          throw new Error(response.statusText)
                        }
                        return response.json()
                      })
                      .catch(error => {
                        swal.showValidationMessage(
                          `Request failed: ${error}`
                        )
                      })
                  }),     
                showCloseButton: true,
                showCancelButton: true,
                focusConfirm: true,
                animation: false,
                customClass: 'modal animation',
                buttonsStyling: false
            }).then( function (result) {
                if (result.value) {
                    console.log (result.value);
                    swal({
                        position: 'top-end',
                        type: 'success',
                        title: 'Deleted!',
                        html: `The track ${result.value.data.title} has been deleted`,
                        showConfirmButton: false,
                        timer: 4000
                        
                    })
                }        
            });    
        }
        
        
        $("#albums").contextMenu({
            selector: 'li', 
            callback: function(key, options) {
                idTrack = options.$trigger.data("id");
                nameTrack = options.$trigger.data("name");
                if(key=="play"){
                    $('#audio').addClass('visible');
                    var srcTrack = 'http://apilb.admira.com/videos/original/3514/'+idTrack+'/'+idTrack+'.mp3'
                    $('#music').attr('src', srcTrack);
                    togglePlay(); //esta es la función play del script del player html5
                    $('.wrapper h4').html(nameTrack);
                }
                if(key=="edit"){
                    checkToken(function(done){
                        if(done){ 
                            trackInfoAreaPage();
                        } 
                    });
                 }
                if(key=="hit"){
                    notifyHit();
                    console.log("hit"); 
                }
                if(key=="delete"){
                    deleteTrack();
                    //$( "#modalDeleteTrack" ).dialog( "open" );
                }
            },
            items: {
                "play": {name: "Play"}, 
                "edit": {name: "Edit"}, 
                "hit": {name: "It's a hit!"},  
                "delete": {name: "Delete"},
            }
        });
    })
}  

function getPlvforAssingPlayer(){
    console.log( "getPlvforAssingPlayer!" );
    
        return $.get("http://apiweb.admira.com/v1/player?access_token="+localStorage.getItem('access_token')+"&project_id=3514", function(result){
                console.log(result);   
                if (result.data.length>0){
                   $("#modalAssign").html("");
                    $.each(result.data, function( index, player ) {
                        var strList= '<li><input type="checkbox" id="'+player.id+'">'+
                                    '<label for="'+player.id+'">'+player.name+'</label></li>';    
                        $("#modalAssign").append(strList);                                                          
                    }); 

                }else{
                    //SI NO HAY DATOS
                }
        }); 
    
}