var client_sso_id="HDrbUa0DbrKCbfaM1pmnpktiTfPOfv"
var callback="http%3A//localhost/newadmira-music/%23callback";
var cs="M7fjIjVapu30eIjw6u4jt45TibuBOi"
var code="";
var login=false;
/************************************
 * 
				ON CHANGE PAGE

	*************************************/
	$(window).on('hashchange', function(){
		// On every hash change the render function is called with the new hash.
        // This is how the navigation of our app happens.
        
        var temp = window.location.hash.split('/')[0];
        temp=temp.split("?");

        if (temp[0]=="#callback") {
            code=temp[1];
            code=code.split("&");
            code=code[0];
            code=code.substr(5,code.length);
            window.history.pushState("object or string", "Title", "/newadmira-music/" );

            console.log("GET TOKEN");        
            getToken();
            //render(decodeURI(temp[0]));
        }else{
            render(decodeURI(window.location.hash));

        }

	});

	// First LOAD, trigger hashchange and determine what page we have to load
	$(window).trigger('hashchange');



/***************************************

				EVENT LISTENERS

	****************************************/

	// Page router event
	$('[data-goto]').click(function(){
		var toScreen = $(this).attr('data-goto');

		if(toScreen == "screen7"){

			if(photoLoaded){

				// Todo ok
				if($('#email').val() == $('#email-confirm').val()){
					email = $('#email').val();
					sendEmail();
					window.location.hash = '#' + toScreen;

				// Opción no-envío de mail
				}else if($('#email').val() == ""){
					window.location.hash = '#' + toScreen;

				// Los emails no coinciden
				}else{
					$('.page_error').removeClass('hidden');
					setTimeout(function(){$('.page_error').addClass('hidden');}, 3000);
				}

			}else{
				// Imagen no cargada todavía
				
			}

		}else{
			window.location.hash = '#' + toScreen;
		}
	});

function loginFunction() {

    window.location.replace('https://accounts.admira.com/login?client_id='+client_sso_id+'&redirect_uri='+callback+'&response_type=code&scope=account.profile account.email');   
}
/******************************************

			RENDER PAGE TO LOAD

*******************************************/
function render(url) {
   

	// Get the keyword from the url.
    var temp = url.split('/')[0];

    var map = {

        // The Homepage.
        '': function() {
            
            playerList();
         
        },
        // The Homepage.
        '#callback': function() {

            console.log("INDEX");        
            getToken();

        },
        '#album-list': function() {
            
            albumList(); 

        },
        '#album-page': function() {

            albumPage();
        },
        '#player-list': function() {
            
            playerList(); 
        },
        '#player-page': function() {

            playerPage();
        },
        '#schedule-list': function() {

            scheduleList();

        },
        '#schedule-page': function() {

            schedulePage();

        },
        '#error-page': function() {

            errorPage();
        },

    };
        //siempre cargamos el Source Area
        sourceArea(); 
 
    
    console.log("SSO");
    var expires=0
    var tempTime=Math.round($.now()/1000);
    if (localStorage.getItem('expires')){
        expires=parseInt(localStorage.getItem('expires'));
        console.log('expires ',expires);
    }
    console.log(tempTime);

    if (!localStorage.getItem('access_token')||expires<=tempTime) {
        loginFunction();
    }else{

        //ESTUDIAR EXCEPCION DE USUARIO PORTAL NEW.ADMIRA.MOBI
        console.log("login");
        login=true;

       // Execute the needed function depending on the url keyword (stored in temp).
        if(map[temp]){
            map[temp]();

            // $( "#source_area" ).load( "http://"+ window.location.host+"/newadmira-music/source-area.html", function() {
            //    console.log( "Load source-area.html." );
            // });
            // $( "#info_area" ).load( "http://"+ window.location.host+"/newadmira-music/info-area.html", function() {
            //     console.log( "Load info-area.html." );
            //  });
        }
        // If the keyword isn't listed in the above - render the error page.
        else {
            errorPage();

        }    
    
      
    }

	
}


// function renderErrorPage(){
// 	alert("")
// }

function refreshToken(callback){

    $.ajax({
        type: "POST",
        url: "https://accounts.admira.com/login/token",
        dataType: "json",
        crossDomain: true,
        data: {
          'client_id': client_sso_id,
          'client_secret': cs,
          'grant_type': 'refresh_token',
          'refresh_token': localStorage.getItem('refresh_token')
        },
        success: function(data){

          if(typeof(Storage) !== "undefined"){
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('expires', data.expires);
            localStorage.setItem('refresh_token', data.refresh_token);

            console.log('Token actualizado!');

            callback(true);

          }
        },
        error: function(err){
          console.log("Error refreshing token -> LOGIN");
          loginFunction();
        }

    });
}

function checkToken(callback){

    if(typeof(Storage) !== "undefined" && localStorage.getItem('access_token') != null && localStorage.getItem('expires') != null){

        // Si está caducado...
        if(localStorage.getItem('expires') <= parseInt((new Date().getTime() / 1000) + 120) ){

            console.log("Token caducado...");

            // Exists refreshToken ? Refresh...
            if(localStorage.getItem('refresh_token') != null){
            
              console.log("Refresh Token...");

              refreshToken(callback);
            
            // Else, do authentication again
            }else{

              console.log("No hay REFRESH Token -> LOGIN");

              loginFunction();
            
            }
        }else{
          console.log("Token Activo");
          
          callback(true);

        }

    }else{
        console.log("No hay token -> LOGIN");
        loginFunction();
    }
}

function getToken() {

    $.ajax({
            type: 'POST',
            url: 'https://accounts.admira.com/login/token',
            dataType: "json",
            crossDomain: true,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data:
                "client_id=" + client_sso_id +
                "&client_secret=" + cs +
                "&grant_type=authorization_code&code=" + code +
                "&redirect_uri=" + callback,
            success: function(response){
                console.log('response ',response);
            
                
                localStorage.setItem('access_token', response.access_token);
                //console.log('token: ' + localStorage.getItem('token'));
                localStorage.setItem('refresh_token', response.refresh_token);
                //console.log('refresh_token: ' + localStorage.getItem('refresh_token'));
                //localStorage.setItem('time_token', $.now());
                localStorage.setItem('expires', response.expires);
                localStorage.setItem('expires_in', response.expires_in);
                console.log(localStorage.getItem('access_token'));
                //console.log('time_token: ' + localStorage.getItem('time_token'));
                //var seconds = 1000;
                //var minutes = seconds * 60;
                //console.log("refresh_token Time:" + Math.round(($.now() - localStorage.getItem('time_token')) / minutes));
                login=true;
                
                window.location.replace("http://"+ window.location.host+"/newadmira-music/");
            },
            error(xhr,status,error){  
                console.log("ERROR OBTENIENDO Token");
                console.log(xhr,status,error);
                localStorage.clear();
                sessionStorage.clear();    
                $location.path('/');
                login=false;
            }
    });

};