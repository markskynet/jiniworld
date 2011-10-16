var canvas;
var context;
var xpos=50;//initial x position of the ball
var ypos=50;//initial y position of the ball
var speed=3;//speed of the ball
var dirX=1;//initial x direction of the ball
var dirY=1;//initial y direction of the ball

window.onload=init;

function init(){
	if(!!document.getElementById('canvas').getContext){
	 canvas=document.getElementById('canvas');
	 context=canvas.getContext('2d');
	 setInterval(animate,20); // setting the interval
	}
	else{
		//add anything you want for non supporting browsers	
	}
}
	
function drawBall(x,y){
	context.beginPath();
	context.arc(x,y,20, 0, Math.PI*2, true);
	context.fillStyle="red";
	context.fill();
}

function animate(){		
	clearContext();
	
	if (xpos>=canvas.width-20||xpos<=20){
    	dirX*=-1;
	}
  	if(ypos>=canvas.height-20||ypos<20){
        dirY*=-1;
	}

	 xpos+=speed*dirX;
	 ypos+=speed*dirY;
	 drawBall(xpos,ypos);
}
	  
function clearContext(){
	 context.clearRect(0,0,canvas.width,canvas.height);
}  