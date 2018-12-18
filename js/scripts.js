//variables generales
const APIWEB_URL="http://apiweb.admira.com/v1/";
var idSchedule,
    idTrack,
    nameTack,
    namePlayer,
    isLoadigContent = false;
    accordionCanPush = true;

  var idAlbum = localStorage.getItem('idAlbum');
  var nameAlbum = localStorage.getItem('nameAlbum');
  var idPlayer = localStorage.getItem('idPlayer');
  var namePlayer  = localStorage.getItem('namePlayer');

////variables para la subida de archivos
 var file,
     title,
     numFiles,
     liNum,
     fileInput, //asignaremos a esta variable, el input cuando carguems albumPage()
     fileList = [];
//////


// variables para el uso del apartado Schedule: Debemos sacar la semana actual en la que estamos, 
// para añidirla a los datos que recibimos y que apereza en fullcalendar
var startOfWeek = moment().startOf('isoWeek');
var endOfWeek = moment().endOf('isoWeek');

var daysOfWeek = {};
var day = startOfWeek;
var i = 0;

while (day <= endOfWeek) {
    daysOfWeek[day.format("dddd")] = day.format("YYYY-MM-DD");
    day = day.clone().add(1, 'd');
    i++;
}
///////////

////Funciones varias/////
/**
 * Función para añadir a cada inputs con clase typpyInput el tooltip tippy para ver caracteres disponibles.
 */
function chargeTyppyInput() {
    $('.typpyInput').each(function(index){
        var iD = $(this).attr('id');
        var elem = $(this);
        var count = "countLeft"+[index];
        var $div = $("<div>", {id: count});
        elem.parent().append($div);
        limiter($(this), elem.attr('maxLength'), $("#countLeft"+[index]));
        tippy('#'+iD, {
            html: document.querySelector('#countLeft'+[index]),
            hideOnClick: false,
            trigger: 'keyup focus',
            placement: 'bottom right',
            arrow: false,
            theme: 'crystal',
            size:'small'
        })
    });
};
/** 
 * Función que cuenta y resta los caracteres disponibles.
 */
function limiter (inputTxt, limit, elem) {
    $(inputTxt).on("keyup focus", function() {
        setCount(this, elem);
    });
    function setCount(src, elem) {
        var chars = src.value.length;
        if (chars > limit) {
            src.value = src.value.substr(0, limit);
            chars = limit;
        }
        elem.html( limit - chars + ' Characters left');
    }
    setCount($(inputTxt)[0], elem);
}
/** 
 * Cambiar la vista en main, por lista o cuadrícula
 */
$("body").on("click", ".showList", function(){   
    var cat = $(this).parent().parent().data('filter'); 
    if (cat==='players'){
        $( "#player" ).removeClass( "grid" );
        $( "#player" ).addClass( "list" );
    }else if (cat==='albums'){
        $( "#album" ).removeClass( "grid" );
        $( "#album" ).addClass( "list" );
    }
    $(this).addClass('active');
    $( ".showGrid" ).removeClass('active');
    $( ".index" ).addClass( "active" );
});
 
$("body").on("click", ".showGrid", function(){   
    var cat = $(this).parent().parent().data('filter');
    if (cat==='players'){
        $( "#player" ).removeClass( "list" );
        $( "#player" ).addClass( "grid" );
    }else if (cat==='albums'){
        $( "#album" ).removeClass( "list" );
        $( "#album" ).addClass( "grid" );
    }
    $(this).addClass('active');
    $( ".showList" ).removeClass('active');  
    $( ".index" ).removeClass( "active" );
});

/** 
 * Cambiar el orden de las vistas en main (players, albums...)
 */
$("body").on("click", "li.index", function(){      
    $(this).toggleClass('ordinal');
    var typeOrder = $(this).parent().parent().data('filter');
    if ($(this).hasClass('ordinal')){
        orderView(typeOrder, 'desc');
    }else{
        orderView(typeOrder, 'asc');
    }
});

/** 
 * Cerrar modales al pulsar fuera de la persiana.
 */
$("body").on("click", "#overlay div", function(){
    $("div:ui-dialog:visible").dialog("close");
});

/** 
 * Función para ordenar las vistas.
 */
var orderObj = {
    'players': {},
    'albums': {},
    'schedules': {},
}
function orderView(typeToOrder, order) {
    var data = orderObj[typeToOrder];

    switch (typeToOrder){
        case "albums":
            $("#album").html("");    
            data.sort(function(a, b) {
                var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                if (order==='asc'){
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    // names must be equal
                    return 0;
                }else{
                    if (nameA > nameB) {
                        return -1;
                    }
                    if (nameA < nameB) {
                        return 1;
                    }
                    // names must be equal
                    return 0;
                }
                
            });
            $.each(data, function( index, album ) {
                var strList='<a href="#album-page"><li data-id="'+album.id+'" data-name="'+album.name+'">'+
                            '<div class="img"><span></span></div>'+
                            '<div>'+
                                '<h3><span>Album</span>'+album.name+'</h3>'+ 
                            '</div>'+
                        '</li></a>';    
                $("#album").append(strList);                                                          
            }); 
            break;

            case "players":
                $("#player").html("");    
                data.sort(function(a, b) {
                    var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                    var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                    if (order==='asc'){
                        if (nameA < nameB) {
                            return -1;
                        }
                        if (nameA > nameB) {
                            return 1;
                        }
                        // names must be equal
                        return 0;
                    }else{
                        if (nameA > nameB) {
                            return -1;
                        }
                        if (nameA < nameB) {
                            return 1;
                        }
                        // names must be equal
                        return 0;
                    }
                    
                });
                $.each(data, function( index, player ) {
                    var strList='<a href="#player-page"><li data-id="'+player.id+'" data-name="'+player.name+'">'+
                            '<div class="img"><span></span></div>'+
                            '<div>'+
                                '<h3><span>Music Player</span>'+player.name+'</h3>'+ 
                            '</div>'+
                            '</li></a>';    
                        $("#player").append(strList);                                                          
                }); 
            break;
    }
   
}

/////////-Funciones jqXHR-///////

/***GET***/
function getUser() {
    return $.ajax({ 
        type: 'GET',
        dataType: 'json',
        crossDomain: true,
        url: APIWEB_URL+"users/me?access_token="+localStorage.getItem('access_token')+"&project_id=3514",
     });
}
function getAlbums() {
    return $.ajax({
        type:'GET',
        dataType: "json",
        crossDomain: true,
        url: APIWEB_URL+"playlist?access_token="+localStorage.getItem('access_token')+"&project_id=3514",      
    });
}
function getAlbumsBlock() {
    return $.ajax({
        type:'GET',
        dataType: "json",
        crossDomain: true,
        url: APIWEB_URL+"block?access_token="+localStorage.getItem('access_token')+"&project_id=3514",      
    });
}

function getAlbumBlock() {
    return $.ajax({
        type:'GET',
        dataType: "json",
        crossDomain: true,
        url: APIWEB_URL+"block/"+idAlbum+"?access_token="+localStorage.getItem('access_token')+"&project_id=3514",      
    });
}
function getAlbum() {
    return $.ajax({
        type:'GET',
        dataType: "json",
        crossDomain: true,
        url: APIWEB_URL+"playlist/"+idAlbum+"?access_token="+localStorage.getItem('access_token')+"&project_id=3514",      
    });
}

function getPlayers() {
    return $.ajax({
        type:'GET',
        dataType: "json",
        crossDomain: true,
        url: APIWEB_URL+"player?access_token="+localStorage.getItem('access_token')+"&project_id=3514",      
    });
}

function getPlayer () {
    return $.ajax({
        type:'GET',
        dataType: "json",
        crossDomain: true,
        url: APIWEB_URL+"players/"+idPlayer+"?access_token="+localStorage.getItem('access_token')+"&project_id=3514",      
    }); 
}

function getInfoPlayer () {
    return $.ajax({
        type:'GET',
        dataType: "json",
        crossDomain: true,
        url: APIWEB_URL+"players/"+idPlayer+"/info?access_token="+localStorage.getItem('access_token')+"&project_id=3514",      
    }); 
}

function getContent(){
    return $.ajax({
        type:'GET',
        dataType: "json",
        crossDomain: true,
        url: APIWEB_URL+"content/"+idTrack+"?access_token="+localStorage.getItem('access_token')+"&project_id=3514",      
    }); 
}

function getSourceTracks(){ 
    return $.ajax({
        type:'GET',
        dataType: "json",
        crossDomain: true,
        url: APIWEB_URL+"playlist/"+idAlbum+"/content?access_token="+localStorage.getItem('access_token')+"&project_id=3514",   
    }); 
}

function getSourceTracksBlock(){ 
    return $.ajax({
        type:'GET',
        dataType: "json",
        crossDomain: true,
        url: APIWEB_URL+"block/"+idAlbum+"/content?access_token="+localStorage.getItem('access_token')+"&project_id=3514",   
    }); 
}

function getSummary(){ 
    return $.ajax({
        type:'GET',
        dataType: "json",
        crossDomain: true,
        url: APIWEB_URL+"emission/summary?access_token="+localStorage.getItem('access_token')+"&project_id=3514",   
    }); 
}

/***POST***/
function postAlbumBlock(nameAlbum, descrAlbum, playMode){
    return $.ajax({
        type:'POST',
        dataType: 'json',
        crossDomain: true,
        url: APIWEB_URL+"block?access_token="+localStorage.getItem('access_token')+"&project_id=3514",
        data: 'name=' + nameAlbum + '&description=' + descrAlbum + '&playmode=' + playMode + '&totalplays=5&skip=0'
     
    });
}

function postAlbum(nameAlbum, descrAlbum){
    return $.ajax({
        type:'POST',
        dataType: 'json',
        crossDomain: true,
        url: APIWEB_URL+"playlist?access_token="+localStorage.getItem('access_token')+"&project_id=3514",
        data: 'name=' + nameAlbum + '&description=' + descrAlbum
    });
}

/***PUT***/
function putAlbum(nameAlbum, descrAlbum, playMode){
    return $.ajax({
        type:'put',
        dataType: 'json',
        url: APIWEB_URL+"block/"+idAlbum+"?access_token="+localStorage.getItem('access_token')+"&project_id=3514",
        data: 'name=' + nameAlbum + '&description=' + descrAlbum + '&playmode=' + playMode   
    });
}
/////////////////////////////////////////////////////

//////////////PLAYERS FUNCTIONS//////////////////
$("body").on("click", "#openerPlayer" , function() {
    var bodyHtml = '<div class="body">'+
                    '<div class="rowL">'+
                    '<div class="thumbnail player"></div>'+
                        '<form>'+
                            '<ul>'+
                                '<li>'+
                                    '<input type="checkbox" id="alwaystop"/>'+
                                    '<label for="alwaystop">Always on top</label>'+
                                '</li>'+
                                '<li>'+
                                    '<input type="checkbox" id="quitonclick"/> '+  
                                    '<label for="quitonclick">Quit on click</label>'+
                                '</li>'+
                                '<li>'+
                                    '<input type="checkbox" id="expositormode"/>'+ 
                                    '<label for="expositormode">Expositor mode</label>'+
                                '</li>'+
                            '</ul>'+
                            '<div class="slider-wrapper">'+
                                '<div class="slider">'+
                                    '<label for="expositormode">Volume</label>'+
                                    '<div id="slidervolume" class="slider"></div>'+
                                '</div>'+
                                '<div class="slider">'+
                                    '<label for="expositormode">Crossfade</label>'+
                                    '<div id="slidercrossfade" class="slider"></div> '+ 
                                '</div>'+           
                            '</div>'+                   
                        '</form>'+      
                    '</div>'+
                    '<div class="rowR">'+
                        '<form>'+    
                        '<label>Name</label>'+
                        '<input type="text" placeholder="Awesome new album"/>'+

                        '<label>Location</label>'+
                        '<input type="text" placeholder="Barcelona"/>'+

                        '<label>Hardware key</label>'+
                        '<input type="text" placeholder="Awesome new album"/>'+

                        '<label>Description</label>'+
                        '<textarea placeholder="At vero eos et accusamus et iusto odio dignissimos ducimus"></textarea>'+ 
                        '</form>'+    
                    '</div>'+
                '</div>'    ;
    swal({
            title: 'Create player',
            // type: 'info',
            html: bodyHtml,
            showCloseButton: true,
            showCancelButton: true,
            focusConfirm: true,
            animation: false,
            customClass: 'modal animation',
            buttonsStyling: false
    })
  });

$("body").on("click", "#player a li", function(){
    idPlayer = $(this).data("id");
    namePlayer = $(this).data("name");
    localStorage.setItem('idPlayer', idPlayer);
    localStorage.setItem('namePlayer', namePlayer);
});

/////////////////////////////////////////////////////


//////////////ALBUMS FUNCTIONS////////////////// 
function deleteAlbum(){
    var bodyHtml = '<div class="body">'+
                        '<p>Estás apunto de eliminar el album <b>'+nameAlbum+'</b>. Esta acción no se podrá deshacer.</p>'
                    '</div>';
    swal({
        title: 'Are you sure?',
        html: bodyHtml,
        showLoaderOnConfirm: true,
        preConfirm: ( function () {
            return fetch(APIWEB_URL+"block/"+idAlbum+"?access_token="+localStorage.getItem('access_token')+"&project_id=3514",
            {
               
                method: 'DELETE',
                credentials: 'include',
                cache: 'no-cache',
                mode:'cors'
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
            alert('wwwweeee', result.value.status)
            swal({
                position: 'top-end',
                type: 'success',
                title: 'Deleted!',
                html: 'he album <b>'+nameAlbum+'</b> has been deleted',
                showConfirmButton: false,
                timer: 2000
                
            })
        }        
    });    
}

$("body").on("click", "#openerAlbum" , function() {
    var bodyHtml = '<div class="body">'+
                        '<div class="rowL">'+
                            '<div class="thumbnail player"></div>'+ 
                        '</div>'+
                        '<div class="rowR">'+
                            '<form>'+    
                                '<label>Name*</label>'+
                                '<input id="nameNewAlbum" class="typpyInput" type="text" placeholder="Awesome new album" maxlength="64" required/>'+

                                '<label>Description</label>'+
                                '<textarea id="descrNewAlbum" class="typpyInput" placeholder="At vero eos et accusamus et iusto odio dignissimos ducimus" maxlength="128"></textarea>'+

                                '<label>Play mode</label>'+
                                '<div>'+
                                '<ul>'+
                                    '<li>'+
                                        '<input type="radio" name="playMode" value="0" id="random" checked></input>'+
                                        '<label for="random">Random</label>'+
                                    '</li>'+
                                    '<li>'+
                                        '<input type="radio" name="playMode" value="2" id="sequential"></input>'+
                                        '<label for="sequential">Sequential</label>'+
                                    '</li>'+
                                '</ul>'+
                                '</div>'+ 
                            '</form>'+    
                        '</div>'+
                    '</div>';
    swal({
        title: 'Create album',
        html: bodyHtml,
        preConfirm: function(){
            if (document.getElementById('nameNewAlbum').checkValidity()) {
                return [
                        ,document.getElementById('nameNewAlbum').value
                        ,document.getElementById('descrNewAlbum').value
                        ,document.querySelector('input[name="playMode"]:checked').value
                       ];
            }  else {
                swal.showValidationMessage(
                    'The Name field is required.'
                  )
            }       
        },
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: true,
        animation: false,
        customClass: 'modal animation',
        buttonsStyling: false
    }).then( function (result) {
            //console.log(result)
            if (Array.isArray(result.value)) {
                createAlbum( result.value[1], result.value[2], result.value[2] );
            } 
            
    });    
    chargeTyppyInput();  //llamamos a la funcion para que los inpunts tengan tooltip que muestre contador de caracteres restantes.
              

});

$("body").on("click", "#album a li", function(){
    idAlbum = $(this).data("id");
    nameAlbum = $(this).data("name");
    localStorage.setItem('idAlbum', idAlbum);
    localStorage.setItem('nameAlbum', nameAlbum);
});

function modifyAlbum(nameAlbum, descrAlbum, playMode){
    $('#overlay').css("display", "flex");
    var name = $.trim(nameAlbum);
    var description = $.trim(descrAlbum);
    $.when( putAlbum(name, description, playMode) ).done(function() {
       
        sourceArea();
        albumList(); 

        $('#overlay').css("display", "");
        swal({  position: 'top-end',
                type: 'success',
                html: 'The album <b>'+nameAlbum+'</b> has been modified',
                showConfirmButton: false,
                timer: 2200
            });
       
    });
    // var promise =  $.ajax({
    //     type:'PUT',
    //     url: "http://apiweb.admira.com/v1/playlist?access_token="+localStorage.getItem('access_token')+"&project_id=3514",
    //     data: 'name=' + nameAlbum + '&description=' + descrAlbum,
    //     success: function(result){
          
    //     },
    //     error(xhr,status,error){
    //         console.log("createAlbum function error: "+xhr,status,error);
    //         // window.location.replace('http://localhost/newadmira-music/');
    //     }
    // });
    // promise.then(function(){
    //     notifyCreate();
    //     $.when( getAlbumsBlock(), getSourceAlbums() )
    //         .then( myFunc, myFailure ); //quitar loader?, está por definir qué hacer después...
    // });
}

function createAlbum(nameAlbum, descrAlbum, playMode){
    $('#overlay').css("display", "flex");
    var name = $.trim(nameAlbum);
    var description = $.trim(descrAlbum);
   // var playmode = 2;
    $.when( postAlbumBlock(name, description, playMode) ).done(function() {
       
        sourceArea();
        albumList(); 

        $('#overlay').css("display", "");
        swal({  position: 'top-end',
                type: 'success',
                html: 'New album added!',
                showConfirmButton: false,
                timer: 2000
            });
       
    });

}

$("body").on("click", "ul.options li:eq(0)", function(){
    getPlvforAssingPlayer().done(function(result){
        $( "#modalAssignAlbum" ).dialog( "open" );
    });
});

$("body").on( "change", "#selectall", function(){
    if(this.checked) 
        $("#modalAssign :checkbox").each(function() {
            this.checked = true;
        });
    else
    $("#modalAssign :checkbox").each(function() {
            this.checked = false;
        });
});


//////////////////////////////////////////////////////


///////////////////DOWNLOAD PLAYERS//////////////////////

$("body").on("click", ".player li", function(){
    var $OS = $(this).attr("id"); 
    switch ($OS) {

        case "windows":
            location.href = "https://new.admira.mobi/Downloads/ADmiraMobi.exe"
        break;
        
        case "apple":
            location.href = "https://new.admira.mobi/Downloads/ADmiraHTML5xOSX.dmg"
        break;
        
        case "ubuntu":
            location.href = "https://new.admira.mobi/download/download_ubuntu"
        break;
        
        case "android":
            location.href = "https://new.admira.mobi/Downloads/ADmiraMobi.apk"
        break;
        
        case "android_html5":
            window.open ("https://new.admira.mobi/download/" + $OS);
        break;
        
        case "ios":
            window.open ("https://new.admira.mobi/download/" + $OS);
        break;
    }
  
});

//////////////////////////////////////////////////////


///////////////////UPLOAD FILES//////////////////////

function loopUloadadContent(i){
     var loop = i || 0;
    
        if(loop < numFiles) {
          
            $('#btn_empty_list').prop("disabled",true); 
            liNum = (loop+1).toString();
                // alert(liNum);
                $("#files_to_upload ul li:nth-child(" + liNum + ")").find("i").removeClass('state0').addClass('state1');
 
            var form_data = new FormData();
            
            file = fileList[loop];
            
            title = file.name.substr(0, file.name.lastIndexOf('.'));
            console.log(title);
            form_data.append('type',1);
            form_data.append('title',title);
            form_data.append('file', fileList[loop]);
            
            var promise = 
                $.ajax({
                    type: 'POST',
                    url: APIWEB_URL+"content?access_token="+localStorage.getItem('access_token')+"&project_id=3514",
                    data: form_data,
                    cache: false,
                    contentType: false,
                    processData: false, 
                    crossDomain: true,
                    dataType: 'json'
                });
                promise.done(function(response){
                    $.ajax({
                        type:'POST',
                        crossDomain: true,
                        dataType: 'json',
                        url: APIWEB_URL+"block/"+idAlbum+"/content?access_token="+localStorage.getItem('access_token')+"&project_id=3514",
                        data: 'content_id=' + response.data.id,
                    });   
                }).done(function(){
                    console.log("Añadida canción: ",title ," al album id ",idAlbum);
                            $("#files_to_upload ul li:nth-child(" + liNum + ")").find("i").removeClass('state1').addClass('state2');      
                            loopUloadadContent(loop+1); 
                })
                promise.fail(function(error){
                    console.log("Error: ",error.message);
                });
   
        }else{
            console.log("terminé de subir");
            swal({  position: 'top-end',
                    type: 'success',
                    html: 'The file(s) has been uploaded',
                    showConfirmButton: false,
                    timer: 2600
                });
 //           ohSnap('The file(s) has been uploaded', {color:'blue',  'duration':'2700'});
            $('#spinner').css("display", "");
            $('.main-uploader').css({'z-index':'', 'background':''});
            $("#upload-input").val("");
            fileList = [];
            setTimeout(function(){ 
                sourceArea();
                albumPage(); 
             }, 2000);
            
        } 
    }  
$("body").on("click", "#btn_upload", function (evt) {
    evt.preventDefault();  
    checkToken(function(done){
        if(done){ 
            if ($("#upload-input").val() !== "") {
                $("#files_to_upload ul").sortable("disable");
                $('#btn_upload').prop("disabled",true);
                numFiles = $('input#upload-input')[0].files.length;
                loopUloadadContent();
                $('#spinner').css("display", "flex");
                $('.main-uploader').css({'z-index':960, 'background':'white'});
                
            }   
        }   
    });         
});

$("body").on("click", "#btn_empty_list", function (evt) {
    evt.preventDefault();
    if ($("#upload-input").val() !== "") {
            $("#files_to_upload ul").html("");
            $("#upload-input").val("");
            fileList = [];
            $('#btn_upload').prop("disabled",false); 
            $("#files_to_upload ul").sortable("enable");
    }
});



function dragToUpload(){
    var drop = $("input#upload-input");
                drop.on('dragenter', function (e) {
                $('.dragarea').addClass('drag-active');

                }).on('dragleave dragend mouseout drop', function (e) {
                $('.dragarea').removeClass('drag-active');
            });
        $('#upload-input').change(function(evnt){
       //     fileList = [];
            for (var i = 0; i < fileInput.files.length; i++) {
                if(fileInput.files[i].type.indexOf('audio/') !== 0) {
                    this.value = null;
                    swal({  position: 'top-end',
                            type: 'error',
                            html: 'One or more files are not audio!',
                            showConfirmButton: false,
                            timer: 2000
                        });
                   // ohSnap('One or more files are not audio!', {color:'red', 'duration':'2000'});
                    return;
                }
                fileList.push(fileInput.files[i]);
            }
            renderFileList();
            console.log("fileList: ", fileList);
        });
}
function renderFileList() {
    $("#files_to_upload ul").html("");
    fileList.forEach(function (file, index) {
        $("#files_to_upload ul").append("<li data-pos="+index+"><span>"+file.name+"</span><i class='material-icons state0'></i></li>");
    });
    $("#files_to_upload ul").sortable({
        containment: '#files_to_upload',
        cursor: 'ns-resize',
        axis: 'y',
        start: function( event, ui ){
            $(ui.item).parent().find('.ui-sortable-placeholder').hide();
        },
        update: function(event, ui) {

            $("#files_to_upload li").each(function(i) {
                fileList[i] = fileInput.files[parseInt($(this).attr('data-pos'))];
            });
            console.log('After fileList ',fileList);
        }
    }); 
  $("#files_to_upload ul").disableSelection();
  };
////////////////////////////////////////////////////////

/**
 * Funcion control tabs en Source Area
 */
function tabs(evt, list) {
    var i, x, tablinks;
    var x = document.getElementsByClassName("source");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none"; 
	}
   
    $('.tablink').each(function(){
        $(this).removeClass('active');
    });

    document.getElementById(list).style.display = "block"; 
    evt.addClass('active');

}

$("body").on("click", ".tablink" , function() {
    var optLink = $(this).text();
    tabs($(this), optLink);
});

// function goBack() {
//     window.history.back();
// } 

function hideInfo(){
    // document.getElementById('info_area').style.transform='translateX(15.625vw)';
    $('#info_area').removeClass('showInfo');
    $('.container').removeClass('opacity1');
    $('#info_area').addClass('hideInfo');
    $('.container').addClass('opacity0');
    $('main').removeClass('minMain');
    $('main').addClass('maxMain');
    $('#audio').removeClass('minMain');
    $('#audio').addClass('maxMain');
}
function showInfo(){
    // document.getElementById('info_area').style.transform='translateX(15.625vw)';
    $('#info_area').removeClass('hideInfo');
    $('.container').removeClass('opacity0');
    $('main').removeClass('maxMain');
    $('main').addClass('minMain');
    $('#info_area').addClass('showInfo');
    $('.container').addClass('opacity1');
    $('#audio').addClass('minMain');
    $('#audio').removeClass('maxMain');
}



//////////////////////////////////////////////* */
//  Schedule
//////////////////////////////////////////////* */

function loadSchedule() {
  
 
    $('#calendar').fullCalendar({
        defaultView: 'agendaWeek',
        allDaySlot: false,
        minTime: '06:00:00',
        maxTime: '30:00:00', // 24h + 6 de minTime
        slotLabelFormat: 'HH:mm',
        timeFormat: 'H:mm',
        slotLabelFormat: 'HH:mm',
        firstDay: 1, //Para que empiece en lunes
        allDaySlot: false,
        eventOverlap: false,
        editable: true,
        droppable: true,
        //navLinks: true, 
        slotDuration: "01:00:00",
        //snapDuration: '01:00:00',
        defaultTimedEventDuration: '02:00:00',
        forceEventDuration: true,
        nowIndicator: true,
        customButtons: {
            CustomButton: {
              text: 'Upload Changes',
              click: function() {
                alert('Upload Changes!');
              }
            }
          },
        header: {
            left: '',
            right: 'CustomButton'
        },
        columnFormat: 'dddd',
       // hiddenDays: [0],


   //     defaultDate: '2018-10-15',
        // views: {
        //     month: { 

        //         droppable: false,
        //         editable: false
        //     }
        // },
    
        drop: function(date, jsEvent, ui, resourceId ) {
            var title = $(jsEvent.target).data('event').title;
            var idAD = $(jsEvent.target).data('event').idAD;
            //alert(date);
            
            $('#calendar').fullCalendar('renderEvent', {

                title: title,
                idAD: idAD,
                start: jsEvent.target.dataset.start,
                end: jsEvent.target.dataset.end
                
              });
        },
        eventRender: function(event, element){
            element.find(".fc-content").prepend("<span class='closeon'></span>");
            element.find(".closeon").on('click', function() {
                $('#calendar').fullCalendar('removeEvents',event._id);
                //ajax para DELETE del álbum asignado a el schedule?
        	});
        },

        eventConstraint: {
            start: '06:00:00',
            end: '30:00:00'
        },
        
        events: function(start, end, timezone, callback) {
            $.ajax({
                url: 'https://next.json-generator.com/api/json/get/Nk-C6ZWrr?indent=2',
                dataType: 'json',
                success: function(days) {
                    var events = [];
                    //recorremos el json, creando una variable para almacener el día de la semana para usarlo en el objeto daysOfWeek y así obtener el día YYYY/MM/DD que corresponde a la semana actual.
                    $.each(days,function(index){
                        var keyDay = Object.keys(days[index]);
                        $.each(days[index], function( i, day){ 
                            $.each(day, function( i, evnt){ 
                                events.push({
                                    title : evnt.title,
                                    start : daysOfWeek[keyDay]+'T'+evnt.start,
                                    end : daysOfWeek[keyDay]+'T'+evnt.end,
                                });
                            });    
                        
                        });                   
                    });
                    callback(events);
                }
                });
          },
          loading: function(bool) {
              if (bool){
                $('#spinner').css("display", "flex");
              }else{
                $('#spinner').css("display", ""); 
              }
         },
        // events: [
        //     {
        //         _id : 1,
        //         title  : 'event1',
        //         start  : '2018-08-03 08:00:00',
        //         end    : '2018-08-03 13:00:00',
        //         description : 'sea'
        //     },
        //     {
        //         _id : 3, 
        //         title  : 'event2',
        //         start  : '2018-08-03 13:00:00',
        //         end    : '2018-08-03 19:00:00',
        //         description : 'seaa'
        //     },

        // ],
        // events: {
        //     url: 'https://next.json-generator.com/api/json/get/EyGcPxZSS?indent=2',
        //     error: function() {
        //         alert("No succes");
        //     },
        //     success: function(){
        //         alert("successful: You can now do your stuff here. You dont need ajax. Full Calendar will do the ajax call OK? ");   
        //         console.log(event.currentTarget.response);
        //     }
        // },
        eventClick: function(calEvent, jsEvent, view) {

            console.log('Event: ' + calEvent.title);
            console.log('Event idAD: ' + calEvent.idAD); 
            console.log('Event start: ' + moment(calEvent.start).format()); 
            console.log('Event end: ' + moment(calEvent.end).format()); 
            console.log('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
            console.log('View: ' + view.name);
        
            // change the border color just for fun
           // $(this).css('border-color', 'red');
        
          },

      })

    //   $.ajax({
    //     url : 'https://next.json-generator.com/api/json/get/Nk-C6ZWrr?indent=2',
    //     dataType: 'json',
    //     success: function(days){
    //         console.log(days);
    //         var events = [];
    //         //recorremos el json, creando una variable para almacener el día de la semana para usarlo en el objeto daysOfWeek y así obtener el día YYYY/MM/DD que corresponde a la semana actual.
    //         $.each(days,function(index){
    //             var keyDay = Object.keys(days[index]);
    //             $.each(days[index], function( i, day){ 
    //                 $.each(day, function( i, evnt){ 
    //                     events.push({
    //                         title : evnt.title,
    //                         start : daysOfWeek[keyDay]+'T'+evnt.start,
    //                         end : daysOfWeek[keyDay]+'T'+evnt.end,
    //                     });
    //                 });    
                  
    //             });                   
    //         });
    //         console.info(events);
    //         //Rellenamos el calendario con el array de eventos
    //         $('#calendar').fullCalendar( 'addEventSource', events);    
    //     }
    // });
    
}
/* [
  {
    "Monday": [
      			{
                "start": "16:00:00",
                "end": "18:00:00",
                "title": "All Day Event"
                },
                {
                  "start": "06:00:00",
                  "end": "10:00:00",
                  "title": "Long Event"
                },
                {
                  "start": "18:00:00",
                  "end": "20:00:00",
                  "title": "Repeating Event"
                }  
      		]

  },
  {
    "Saturday": [
      			{
                "start": "16:00:00",
                "end": "18:00:00",
                "title": "All Day Event"
                },
                {
                  "start": "06:00:00",
                  "end": "10:00:00",
                  "title": "Long Event"
                },
                {
                  "start": "18:00:00",
                  "end": "20:00:00",
                  "title": "Repeating Event"
                }  
      		]

  }
  
] */

//////////////////////////////////////////////////


  $(function() {

    loadModals();
    indexPage();
 });
  
  function loadModals(){
  
    $( "#modalPlayer" ).dialog({
        draggable: false,   
        autoOpen: false,
        width: "auto",
        dialogClass: "modal",
        closeText: "",
        closeOnEscape: true,
        show: {
            effect: "fade",
            duration: 500
        },
        hide: {
            effect: "fade",
            duration: 500
        },
        buttons: {
            Cancelar: function() {
            $( this ).dialog( "close" );
            },
            Crear: function() {
            $( this ).dialog( "close" ),
            notifyCreate();
            }
        },
        open: function() {
            $('#overlay').css("display", "flex");
        },
        close: function(){
            $('input', this ).val("");
            $('#overlay').css("display", "");
        }
     });

    $( "#modalDeleteTrack" ).dialog({
        draggable: false,   
        autoOpen: false,
        width: "35vw",
        dialogClass: "modal",
        closeText: "",
        closeOnEscape: true,
        show: {
          effect: "fade",
          duration: 500
        },
        hide: {
          effect: "fade",
          duration: 500
        },
        buttons: {
          Eliminar: function() {
              $( this ).dialog( "close" );
             
              $.ajax({
                  type: 'DELETE',
                  url: "http://apiweb.admira.com/v1/content/"+idTrack+"?access_token="+localStorage.getItem('access_token')+"&project_id=3514",
                  success: function(result) {
                  //    notifyCreate();
                  }
              });        
          },
          Cancelar: function() {
            $( this ).dialog( "close" );
            
         }
        },
        open: function ()
          {
            $('#overlay').css("display", "flex");  
            $('p', this ).html("Estás apunto de eliminar el track <b>"+nameTrack+"</b>. Esta acción no se podrá deshacer.");
          },   
        close: function(){
            $('#overlay').css("display", "");
        }
    });

    $( "#modalAssignAlbum" ).dialog({
        draggable: false,   
        autoOpen: false,
        width: "25vw",
        dialogClass: "modal",
        closeText: "",
        closeOnEscape: true,
        show: {
          effect: "fade",
          duration: 500
        },
        hide: {
          effect: "fade",
          duration: 500
        },
        buttons: {
          Cancel: function() {
            $( this ).dialog( "close" );
          },
          Assign: function() {
            putPlaylistToPlayer(idPlayer);  
            $( this ).dialog( "close" );
            //notifyCreate();
          }
        },
        open: function(){
            $('#overlay').css("display", "flex");
        },
        close: function(){
            $('#overlay').css("display", "");
        }
      });
      $( "#modalDelete" ).dialog({
        draggable: false,   
        autoOpen: false,
        width: "35vw",
        dialogClass: "modal",
        closeText: "",
        closeOnEscape: true,
        show: {
          effect: "fade",
          duration: 500
        },
        hide: {
          effect: "fade",
          duration: 500
        },
        buttons: {
   
        Cancelar: function() {
            $( this ).dialog( "close" );
         },
         Eliminar: function() {
            
            $( this ).dialog( "close" );
            $.ajax({
                type: "DELETE",
                dataType: "json",
                crossDomain: true,
                cache: false,
                contentType: false,
                processData: false, 
                url: "http://apiweb.admira.com/v1/block/"+idAlbum+"?access_token="+localStorage.getItem('access_token')+"&project_id=3514",
                success: function(result) {
                    //notifyCreate();
                }
            });        
        },
        },
        open: function ()
        {
            $('#overlay').css("display", "flex");
            $('p', this ).html("Estás apunto de eliminar el album <b>"+nameAlbum+"</b>. Esta acción no se podrá deshacer.");
        },   
        close: function()
        {
            $('#overlay').css("display", "");
        }
      });
      $( "#modalAlbum" ).dialog({
        draggable: false,   
        autoOpen: false,
        responsive: true,
        width: 'auto',
        dialogClass: "modal",
        closeText: "",
        closeOnEscape: true,
        show: {
          effect: "fade",
          duration: 500
        },
        hide: {
          effect: "fade",
          duration: 500
        },
        buttons: {
          Cancelar: function() {
            $( this ).dialog( "close" );
          },
          Crear: function() {
            $( this ).dialog( "close" );
            createAlbum($('#new_album_name').val(), $('#new_album_descr').val());
          }
        },
        open: function(){
            $('#overlay').css("display", "flex");
            $('.modal').addClass("active");
        },
        close: function(){
            $('input', this ).val("");
            $('#overlay').css("display", "");
            $('.modal').removeClass("active");

        }
      });
  }

// $('selector').each(function(){
//     var $this = $(this), numberOfOptions = $(this).children('option').length;
  
//     $this.addClass('select-hidden'); 
//     $this.wrap('<div class="select"></div>');
//     $this.after('<div class="select-styled"></div>');

//     var $styledSelect = $this.next('div.select-styled');
//     $styledSelect.text($this.children('option').eq(0).text());
  
//     var $list = $('<ul />', {
//         'class': 'select-options'
//     }).insertAfter($styledSelect);
  
//     for (var i = 0; i < numberOfOptions; i++) {
//         $('<li />', {
//             text: $this.children('option').eq(i).text(),
//             rel: $this.children('option').eq(i).val()
//         }).appendTo($list);
//     }
  
//     var $listItems = $list.children('li');
  
//     $styledSelect.click(function(e) {
//         e.stopPropagation();
//         $('div.select-styled.active').not(this).each(function(){
//             $(this).removeClass('active').next('ul.select-options').hide();
//         });
//         $(this).toggleClass('active').next('ul.select-options').toggle();
//     });
  
//     $listItems.click(function(e) {
//         e.stopPropagation();
//         $styledSelect.text($(this).text()).removeClass('active');
//         $this.val($(this).attr('rel'));
//         $list.hide();
//         //console.log($this.val());
//     });
  
//     $(document).click(function() {
//         $styledSelect.removeClass('active');
//         $list.hide();
//     });

// });
 function loadAlbumsSearch (){
                 
    var arr = [];
    $.when( getAlbumsBlock() ).done(function(albums) {

        $.each(albums.data, function( index, album ) {

            arr.push({value: album.id, label:album.name}) 
        
        });
    });

    $("#autocomplete_album").autocomplete({
        //source: data
        position: {
            my : "left+0 top+15"
        },
        delay: 500,
        minLength: 0,
        source : arr,
        focus: function(event, ui) {
            // prevent autocomplete from updating the textbox
            event.preventDefault();
            $(this).val(ui.item.label);
        },
        select: function(event, ui) {
            // prevent autocomplete from updating the textbox
            event.preventDefault();
            idAlbum = ui.item.value;
            nameAlbum = ui.item.label;
            window.location.hash = "#album-page";
        
        }
    }).focus( function () {
        $(this).autocomplete("search", '');
    }).autocomplete("widget").attr('style', 'max-height: 400px; overflow-y: auto; overflow-x: hidden;');
  
 }

 function loadPlayerSearch (){
                 
    var arr = [];
    $.when( getPlayers() ).done(function(players) {
            $.each(players.data, function( index, player ) {

                arr.push({value: player.id, label:player.name}) 
            
            });
    });

    $("#autocomplete_player").autocomplete({
        //source: data
        delay: 500,
        minLength: 0,
        source : arr,
        focus: function(event, ui) {
            // prevent autocomplete from updating the textbox
            event.preventDefault();
            $(this).val(ui.item.label);
        },
        select: function(event, ui) {
            // prevent autocomplete from updating the textbox
            event.preventDefault();
            idPlayer = ui.item.value;
            namePlayer = ui.item.label;
            window.location.hash = "#player-page";
        
        }
    }).focus( function () {
        $(this).autocomplete("search", '');
    }).autocomplete("widget").attr('style', 'max-height: 400px; overflow-y: auto; overflow-x: hidden;');

 }
//////////////////////////////////////////////* */
//  tagify
//////////////////////////////////////////////* */

$('[name=tagsmodal]').tagify();

//////////////////////////////////////////////* */
//  colorpicker
//////////////////////////////////////////////* */

$(".colorPickSelector").colorPick({
    'initialColor': '#3498db',
    'allowRecent': true,
    'recentMax': 5,
    'palette': ["#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#9b59b6", "#8e44ad", "#34495e", "#2c3e50", "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#e74c3c", "#c0392b", "#ecf0f1", "#bdc3c7", "#95a5a6", "#7f8c8d"],
    'onColorSelected': function() {
        this.element.css({'backgroundColor': this.color, 'color': this.color});
    }
});

//////////////////////////////////////////////* */
//  ohsnap
//////////////////////////////////////////////* */

function notify(){
    ohSnap('Changes saved!', {'duration':'2000'}); 
    
}

//////////////////////////////////////////////* */
//  launcher
//////////////////////////////////////////////* */


$( "#launcher" ).click(function() {
    $( "#app-selector" ).toggleClass( "visible" );
    $( ".triangle" ).toggleClass( "visible" );
    
  }
);
$( "#menu" ).click(function() {
    $( "nav" ).toggleClass( "visible" ); 
  }
);

jQuery('img.svg').each(function(){
    var $img = jQuery(this);
    var imgID = $img.attr('id');
    var imgClass = $img.attr('class');
    var imgURL = $img.attr('src');

    jQuery.get(imgURL, function(data) {
        // Get the SVG tag, ignore the rest
        var $svg = jQuery(data).find('svg');

        // Add replaced image's ID to the new SVG
        if(typeof imgID !== 'undefined') {
            $svg = $svg.attr('id', imgID);
        }
        // Add replaced image's classes to the new SVG
        if(typeof imgClass !== 'undefined') {
            $svg = $svg.attr('class', imgClass+' replaced-svg');
        }

        // Remove any invalid XML tags as per http://validator.w3.org
        $svg = $svg.removeAttr('xmlns:a');

        // Check if the viewport is set, if the viewport is not set the SVG wont't scale.
        if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
            $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
        }

        // Replace image with new SVG
        $img.replaceWith($svg);

    }, 'xml');

});

//////////////////////////////////////////////* */
//  AudioPlayer
//////////////////////////////////////////////* */
   
var music = document.getElementById('music'),
    onplayhead = false,
    percent,
    playBtn = document.getElementById('pButton'),
    closeButton = document.getElementById('closeButton'),
    progressbar = document.getElementById('seekObj');

     

music.addEventListener('timeupdate', timeUpdate, false);
playBtn.addEventListener('click', togglePlay, false);
closeButton.addEventListener("click", closeAudioPlayer, false);
music.addEventListener('ended', endSong, false);
progressbar.addEventListener('click', seekclick, false);
// progressbar.addEventListener('mousedown', function(){
//     onplayhead = true;
//     this.addEventListener('mousemove', seek, false);
// }, false);
// window.addEventListener("mouseup", function() {
   
//     if (onplayhead) {
//         this.removeEventListener('mousemove', seek, true);
//         progressbar.value = percent / 100;
//     }
//     onplayhead = false;       
// }, false);  

function timeUpdate() {
    var value = (music.currentTime / music.duration);
    if (value >= 0 || value <= 1) {
        progressbar.value = (music.currentTime / music.duration);
    } 
    
    if (music.currentTime === music.duration) {
        endSong();
    }
};
  

function seekclick(evt) {
    percent = evt.offsetX / this.offsetWidth;
    progressbar.value = percent / 100; 
    music.currentTime = percent * music.duration;
}

function seek(evt) {
    if (onplayhead) {
        percent = evt.offsetX / this.offsetWidth;
        music.currentTime = percent * music.duration;

    }    
}
 
 function togglePlay() {
   if (music.paused === false) {
     music.pause();
     $('#pButton').removeClass('pause');
     $('#pButton').addClass('play');
 
   } else {
     music.play();
     $('#pButton').removeClass('play');
     $('#pButton').addClass('pause');
   }
 }

 function endSong() {
    $('#pButton').removeClass('pause');
    $('#pButton').addClass('play');
    music.currentTime = 0;
    progressbar.value = 0;
    music.pause();
}
function closeAudioPlayer() {
    var audioArea = document.getElementById('audio');
    audioArea.classList.remove('visible');
    setTimeout(function(){ 
        music.src = "";
     }, 3000);

    
    endSong();
    //music.src = "";
}