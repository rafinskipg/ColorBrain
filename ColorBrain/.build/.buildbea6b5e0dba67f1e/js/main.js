
var GAME;
var PIECES =[];
var POINTS_COUNTER;
var TIME_COUNTER;
var MAX_PIECES  = 30;
var NUM_COLS  = 5;


//Create the canvas
var canvas = document.createElement("canvas");
var context = canvas.getContext("2d");
var canvasPosition = {
	    x: $(canvas).offset().left,
	    y: $(canvas).offset().top
	};
    
var backgroundImage = 'images/Logotop.png';
var defaultImage = 'images/crate_0.png';
var extraPiece = 'images/ham.png';

//Load IMG Resources
resources.load([
  backgroundImage,
  defaultImage,
  extraPiece
]);


//Initialize function
var init = function () {
	//context.canvas.width =  $('#game').width();
    canvas.style.height = 600;
    canvas.style.width = 400;
	context.canvas.width =  window.innerWidth;
	context.canvas.height = (window.innerHeight ) - 150;
	
    
	GAME = new gameData();
	GAME.homeScreen();
	$('.logo').on('vclick', function(){
		
		
		GAME.finish();
	});
	
	POINTS_COUNTER = $('#points_counter');
    POINTS_COUNTER.on('webkitAnimationEnd',   
        function(e) {
        // code to execute after animation ends
           POINTS_COUNTER.removeClass('sizeAnim');
           
        });
	TIME_COUNTER = $('#time_counter');
};

//window.onload can work without <body onload="">
window.onload = init;


//shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();



var gameData = function(){
	this.now = Date.now();
	this.then;
    
    this.level = 1;
	this.hasEnded = false;
	this.paused = false;
    this.showInfo = true;
	this.counter = {
			points : 0,
			time : 0, 
            max_time: 0,
	}
	
	this.setValues = function(){
		POINTS_COUNTER.html(this.counter.points);
		var time = parseInt(this.counter.time/1000);
		if(time > -1){
			TIME_COUNTER.html(time);
		}
		
	}
	
	this.reset = function(){
		TIME_COUNTER.removeClass("warningAnim");
		for(var i = 0; i < PIECES.length; i++){
			//PIECES[i].off('handleClick');
			PIECES[i] = null;
			
		}
        PIECES = [];
       
        var x,y, col;
        x =y = col = 0;
        var height , width;
        height = width = canvas.width/NUM_COLS;
        
        var COLORS = generateColorsFor(MAX_PIECES, this.level);
        var randomPiece = RandomValue(0, MAX_PIECES -1);
        
        for(var i = 0; i < MAX_PIECES; i++){
            
            if(col == NUM_COLS){
                y = y + height;
                x = 0;
                col = 1;
            }else{
                x = col*width ;
                
                col++;
            }
            var piece = new Piece(x, y,width,height, COLORS[i]);
            if(randomPiece == i){
            	piece.isExtra = true;
            	
            }
            PIECES.push(piece);
        }
	
		this.counter.points = 0;
        
		this.counter.time = 36000 - (this.level * 1000);
		this.counter.max_time = 36000  - (this.level * 1000);
		this.showInfo = true;
		this.setValues();
		this.then = Date.now();
		this.now = Date.now();
		
	}
	
	this.homeScreen = function(){
		
		GAME.level = 1;
		
		$('#game').html('');
		$('#game').append(' <p>Remember the positions of the colors and try to <b>Transmute</b> as many cells together as you can.</p> <br/><p>Complete 10 levels and train your brain!</p>'); 
		$('#game').append('<p class="'+getBalance()+'">Last Score: '+getBestScore()+' points</p>');
		 
	}
	
	this.save = function(){
        var points = this.counter.points;
        var lastP = localStorage["brainTrainPoints"];
        
        if(lastP < points){
           localStorage['brainTrainBalance'] = 'positive';
        }else{
            localStorage['brainTrainBalance'] = 'negative';
        }
        localStorage["brainTrainPoints"] = points;
        this.reset();
        this.counter.points = points;
        
       
       
	}
	this.finish = function(){
		
		
		this.save();
		this.hasEnded = true;
		this.homeScreen();
	}
	this.update = function(modifier){	
		this.counter.time = this.counter.time - modifier* 1000;
        
        var seconds = parseInt(this.counter.time/1000) ;
        if(seconds<10){
        	TIME_COUNTER.addClass('warningAnim');
        }
        if(seconds== 0 || seconds< 0){
            this.paused = true;
        }
        if( parseInt(this.counter.max_time/1000) - seconds == 5){
            GAME.showInfo = false;
        }
	}
	
	this.render = function(){
		context.drawImage(resources.get(backgroundImage), 0, 0,canvas.width, 400);
    	
		for(var i = 0; i<PIECES.length; i++){
			PIECES[i].draw();
		}
		this.setValues();	
	}
}


function mainGameLoop(){
	if(GAME.hasEnded){
       //Do nothing
    }else{
        if( GAME.paused){
        	
        	
        	if(GAME.level < 10){
        		showPoints(GAME.counter.points).done(function(){
        			GAME.save();
        			GAME.level++;
        			GAME.paused = false;
        			GAME.showInfo = true;
        			requestAnimFrame(mainGameLoop);
        			console.log('New level starting');
        		 });
        	}else{
        		showCongrats().done(function(){
        			
        			GAME.finish();
        			
                });
        	}
     
           
        }else{
            GAME.now = Date.now();
            if(typeof(GAME.then) == 'undefined'){
                 GAME.then = Date.now();
            }
            var delta = GAME.now - GAME.then;
            GAME.update(delta/1000);
            
            GAME.then = GAME.now;
            //raf is better than set interval
            requestAnimFrame(mainGameLoop);
            //Render after raf its better
            GAME.render();
        }
    
    }
    	
}

function start() {
    $('#game').html('');
	document.getElementById('game').appendChild(canvas);
	canvasPosition = {
		    x: $(canvas).offset().left,
		    y: $(canvas).offset().top
		};
	$(canvas).on('vclick', function(e) {
	    console.log('triggered click');
	    var mouse= {
	        x: e.pageX - canvasPosition.x,
	        y: e.pageY - canvasPosition.y
	    }
	    
	   
	    //fire off synthetic event containing mouse coordinate info
	    $(canvas).trigger('handleClick', [mouse]);
	});
	
	 $(canvas).on('handleClick', function(e, mouse) {
	       console.log('aa');
	        // perform hit test between bounding box 
	        // and mouse coordinates
	        //mouse.x =  ( mouse.x / $('canvas').width())  ;
	        //mouse.y = ( mouse.y / $('#canvas').height()) * 400;
	       if(GAME.showInfo){
	    	   return;
	       }
	       for(var i = 0; i < PIECES.length; i++){
	    	  var that = PIECES[i]; 
	    	   if (that.fixed){
				        continue;
			    }
	    	   if (that.x < mouse.x &&
	    			   that.x + that.width > mouse.x &&
	    			   that.y < mouse.y &&
	    			   that.y + that.height > mouse.y) {
	   	        	   
	   	            
	   	                that.state = that.state * -1;
	   	                
	   	                if(that.state == -1){
	   	                    //IF there is other opened and its not same color , reset all pieces
	   	                    if(!isSameColor(that.color)){
	   	                        resetPieces();
	   	                        console.log('reset Pieces');
	   	                        that.state = -1;
	   	                        GAME.counter.points -=50;
	   	                    }
	   	                
	   	                } 
	   	        	
	   	        }
	       }
	       
	       
	    });
	 
	GAME.hasEnded = false;
	
	GAME.reset();
	
    mainGameLoop(); 
     
}
$(window).resize(function(){
   /* console.log('a');
    $(canvas).width( window.innerWidth);
    var x= y= col = 0;
	
        var height = width = window.innerWidth/NUM_COLS;
        
       
        for(var i = 0; i < PIECES.length; i++){
            
            if(col == NUM_COLS){
                y = y + height;
                x = 0;
                col = 1;
            }else{
                x = col*width ;
                
                col++;
            }
            
            PIECES[i].height = height;
            PIECES[i].width = width;
            PIECES[i].x = x;
            PIECES[i].y = y;
            
            PIECES[i].draw();
        }
     */
});



function Piece(x, y, width, height, color) {
    var self = this;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.state = 1;
    this.isExtra = false;
   
    this.defaultImage = defaultImage;
    this.color = color;
    this.fixed = false;
    var that = this;
    
   
    
    
    this.draw = function(){
    	
    	if(GAME.showInfo || this.state == -1 || this.fixed == true){
            context.strokeStyle = 'black';
            if(this.fixed == true){
            	 context.fillStyle = this.color.rgba;
            }else{
            	context.fillStyle = this.color.rgb;
            }
           
            
            context.fillRect (this.x, this.y, this.width, this.height);
            context.strokeRect (this.x, this.y, this.width, this.height);
            if(this.isExtra){
            	context.drawImage(resources.get(extraPiece), this.x, this.y,this.height, this.width);
            	
            }
              
        }else{
            context.drawImage(resources.get(this.defaultImage), this.x, this.y,this.height, this.width);
        }
    	
    }
}
var resetPieces = function(){
    
    for(var i = 0; i < PIECES.length; i ++){
        PIECES[i].state = 1;
       
    }
}

var isSameColor = function(color){
    var check = true;
    for(var i = 0; i < PIECES.length; i ++){
        if(PIECES[i].fixed == false && PIECES[i].state == -1 && PIECES[i].color != color){
            check = false;
        }
       
    }
  
    return check;
}

//Get that points
var BuyPieces = function(){
    var ammount= 0;
    for(var i = 0; i < PIECES.length; i++){
            if(PIECES[i].state == -1 && PIECES[i].fixed == false){
                ammount++;
            }
    }
    if(ammount > 1){
    	var points = ammount * 100
    	
    	 for(var i = 0; i < PIECES.length; i++){
             if(PIECES[i].state == -1 && PIECES[i].fixed == false){
                 PIECES[i].fixed = true;
                 if(PIECES[i].isExtra){
                	 points+= 200;
                 }
             }
    	 }
        
        var extra_points =( ammount -1 )* 100 * 1.5;
        addPoints(points+extra_points);
    }
   
}

function addPoints(points){
    GAME.counter.points = GAME.counter.points + points;
    POINTS_COUNTER.addClass('sizeAnim');
   
    
    
}

function showPoints(points){
    var dfd = $.Deferred();
    
    $('body').append('<div class="pointsAnimated">'+points+ ' points!<br/> Next level...</div>');
     
    $('.pointsAnimated').on('webkitAnimationEnd',   
    function(e) {
    // code to execute after animation ends
        $('.pointsAnimated').remove();
         dfd.resolve();
    });
     


    return dfd.promise();
}

function showCongrats(){
	  var dfd = $.Deferred();
	    
	    $('body').append('<div class="congratsAnimated '+getBalance()+'">'+GAME.counter.points+ ' points!<br/> You did it...!</div>');
	     
	    $('.congratsAnimated').on('webkitAnimationEnd',   
	    function(e) {
	    // code to execute after animation ends
	        $('.congratsAnimated').remove();
	         dfd.resolve();
	    });
	     


	    return dfd.promise();
}

function generateColorsFor(numPieces, lvl){
   var colors = [];
   var difficulty = 6;
   
   
   
   if(lvl < 8) difficulty = 5;
    if(lvl < 6) difficulty = 4;
    if(lvl < 4) difficulty = 3;
    
   for(var i = 0; i < difficulty; i++){
        colors.push(PALETTE[i]);
    
   }
   var returnColors = []
   for(var i = 0; i<numPieces; i++){
       var b = RandomValue(0, colors.length - 1);
       returnColors.push(colors[b]);
   }
   
   return returnColors;
}

 var  RandomValue = function (MinValue,MaxValue)
    {
        return parseInt(Math.random()*(MaxValue-MinValue+1), 10)+MinValue;
    }
    
 var PALETTE = [
    {rgb: 'rgb(184,0,0)',rgba: 'rgba(184,0,0,0.3)'},
    {rgb: 'rgb(128,128,128)',rgba: 'rgba(128,128,128,0.3)'},
    {rgb: 'rgb(255,255,255)',rgba: 'rgba(255,255,255,0.3)'},
    {rgb: 'rgb(0,255,0)',rgba: 'rgba(0,255,0,0.3)'},
    {rgb: 'rgb(255,255,0)',rgba: 'rgba(255,255,0,0.3)'},
    {rgb: 'rgb(255,0,255)',rgba: 'rgba(255,0,255,0.3)'}
 ]
 
 
 //SCores
 
 var getBestScore = function(){
    var points = localStorage["brainTrainPoints"];
    if(points){
        return points;
    }else{
        localStorage["brainTrainPoints"] = 0;
        return 0;
    }
 
 }   
 
 var getBalance = function(){
    var balance = localStorage["brainTrainBalance"];
    if(balance){
        return balance;
    }else{
        localStorage["brainTrainBalance"] = 'none';
        return 0; 
    }
 
 }