
var validUserSession = isValidUserSession();
function isValidUserSession(){
	
    var sesStorage = getSessionStorage() || displayError('Session Storage not supported.');
    var userName = sesStorage.getItem('userName');
    
    if(userName == null){
    	sesStorage.setItem('message','Welcome to Jini World. Please Login.');
    	var pagename = getPageName();
    	window.location = getRedirectURL(pagename,"login");
    }
}


