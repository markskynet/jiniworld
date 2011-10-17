window.addEventListener('load', eventWindowLoaded, false);	
function eventWindowLoaded() {
	canvasApp();
}

function canvasSupport () {
  	return Modernizr.canvas;
}

function canvasApp(){
	if (!canvasSupport()) {
			 return;
  	}else{
	    var theCanvas = document.getElementById('canvas');
	    var context = theCanvas.getContext('2d');
	}
	
	var photo=new Image();
	photo.addEventListener('load', eventPhotoLoaded , false);
	photo.src="images/butterfly.jpg";
	
	//3548 x 2736
	
	var windowWidth=300;
	var windowHeight=300;
	
	var windowX=0;
	var windowY=0;
	
	function eventPhotoLoaded() {
		startUp();
	}

	function drawScreen(){
		context.drawImage(photo, windowX, windowY,windowWidth,windowHeight,0,0,windowWidth*1.5,windowHeight*1.5);

		windowX+=10;
		if (windowX>photo.width - windowWidth){
			windowX=photo.width - windowWidth;
		}
	}
	
	function startUp(){
		setInterval(drawScreen, 100 );
	}
}
