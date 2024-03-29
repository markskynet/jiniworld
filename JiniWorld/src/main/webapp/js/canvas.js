buildSpinner({ x : 50, y : 50, size : 20, degrees : 30 });

function buildSpinner(data) {
  
  var canvas = document.createElement('canvas');
  canvas.height = 100;
  canvas.width = 300;
  document.getElementsByTagName('article')[0].appendChild(canvas);
  var ctx = canvas.getContext("2d"),
    i = 0, degrees = data.degrees, loops = 0, degreesList = [];
    
  for (i = 0; i < degrees; i++) {
    degreesList.push(i);
  }
  
  // reset
  i = 0;
  
  // so I can kill it later
  window.canvasTimer = setInterval(draw, 1000/degrees);  

  function reset() {
    ctx.clearRect(0,0,100,100); // clear canvas
    
    var left = degreesList.slice(0, 1);
    var right = degreesList.slice(1, degreesList.length);
    degreesList = right.concat(left);
  }
  
  function draw() {
    var c, s, e;

    var d = 0;

    if (i == 0) {
      reset();
    }

    ctx.save();

    d = degreesList[i];
    c = Math.floor(255/degrees*i);
    ctx.strokeStyle = 'rgb(' + c + ', ' + c + ', ' + c + ')';
    ctx.lineWidth = data.size;
    ctx.beginPath();
    s = Math.floor(360/degrees*(d));
    e = Math.floor(360/degrees*(d+1)) - 1;

    ctx.arc(data.x, data.y, data.size, (Math.PI/180)*s, (Math.PI/180)*e, false);
    ctx.stroke();

    ctx.restore();

    i++;
    if (i >= degrees) {
      i = 0;
    }
  }  
}