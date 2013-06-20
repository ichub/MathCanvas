jQuery(function($) {

	// gets the canvas and its context
	var canvas = $('#myCanvas')[0];
	var ctx = canvas.getContext('2d');

	//enable-time checkbox
	var timeCheckbox = $('#timeInput')[0];
	//is anitmation enabled?
	var timeEnabled = timeCheckbox.checked;

	// whether or not the options are currently being shown
	var areOptionsEnabled = false;

	// the amount of miliseconds it takes for the div to change
	// its state when activated
	var divSpeed = 200;

	// the amount of space between each drawn pixel.
	// does not affect the color calculations
	var spacing = 0;

	// if true, then the x and y parameters of the color
	// calculation functions will be the actual position of 
	// the square. otherwise, the number of the point
	// will be passed - its number horizontaly and vertically
	var useActualCoordinates = true;

	// functions that are inputed by the user, and are used
	// to calculate the color of each pixel
	var redFunction = "100;";
	var greenFunction = "100;";
	var blueFunction = "100;";

	// size of each point in pixels
	var pointDimensions = {
		X: 10,
		Y: 10,
	};

	// dimensions are in amount of pixels
	var displayDimensions = {
		X: 100,
		Y: 50,
	};

	// updates the timeEnabled var
	var updateTime = function() {
		timeEnabled = timeCheckbox.checked;
	};

	// hides the options div
	var hideDiv = function() {
		$('#options')[0].style.display = 'none';
		$('#blinds')[0].style.display = 'none';
	};

	// shows the options div
	var showDiv = function() {
		$('#options')[0].style.display = 'inline';
		$('#blinds')[0].style.display = 'inline';
	};

	var hideWorking = function() {
		$('#working')[0].style.display = 'none';
		$('#blinds')[0].style.display = 'none';
	}

	var showWorking = function() {
		$('#working')[0].style.display = 'inline';
		$('#blinds')[0].style.display = 'inline';
	}

	// resizes the canvas so it fits the whole screen
	var onResize = function() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		displayDimensions.X = window.innerWidth / (pointDimensions.X);
		displayDimensions.Y = window.innerHeight / (pointDimensions.Y);
		draw();
	};

	// converts an rgb value to a string that can be used
	// to style each point
	var RGB = function (R, G, B) {
		return "#" + (R < 16 ? '0' : '') + R.toString(16) + (G < 16 ? '0' : '') + G.toString(16) + (B < 16 ? '0' : '') + B.toString(16);
	};	

	// calculates the red value of the pixel located at (x, y)
	var calcR = function (x, y, t) {
		try{
			return eval("(function() { return " + redFunc + ";}())");
		}catch(e){
			alert("Sorry, the code for red must be valid javascript. It gave the error" + e.toString);
		}
	};

	// calculates the green value of the pixel located at (x, y)
	var calcG = function (x, y, t) {
		try{
			return eval("(function() { return " + greenFunc + ";}())");
		}catch(e){
			alert("Sorry, the code for green must be valid javascript. It gave the error" + e.toString);
		}
	};
	// calculates the blue value of the pixel located at (x, y)
	var calcB = function (x, y, t) {
		try{
			return eval("(function() { return " + blueFunc + ";}())");
		}catch(e){
			alert("Sorry, the code for blue must be valid javascript. It gave the error" + e.toString);
		}
	};

	// calculates the color of the pixel located at (x, y)
	var calcColor = function (x, y, t) {
		var r = Math.floor(Math.abs(calcR(x, y, t))) % 256;
		var g = Math.floor(Math.abs(calcG(x, y, t))) % 256;
		var b = Math.floor(Math.abs(calcB(x, y, t))) % 256;

		// var||100 gives 100 if var is undefined, var otherwise
		return RGB((r||100), (g||100), (b||100));
	}

	// gets the pixel position given its index
	var getPixelPosition = function(i, j) {
		return {
			x: i * (pointDimensions.X + spacing),
			y: j * (pointDimensions.X + spacing),
		};
	}

	var drawTimeouts = [];
	// draws all the pixels
	var draw = function (t) {
		if(!t){t = 0;}
		updateTime();
		//console.log("drawing",t)
		redFunc = $('#redFunc').val();
		greenFunc = $('#greenFunc').val();
		blueFunc = $('#blueFunc').val();

		for (var i = 0; i < displayDimensions.X; i++) {
			for (var j = 0; j < displayDimensions.Y; j++) {

				var position = getPixelPosition(i, j);
				if (useActualCoordinates) {	
					ctx.fillStyle = calcColor(position.x, position.y, t);
				}
				else {
					ctx.fillStyle = calcColor(i, j, t);
				}

				ctx.fillRect(
						position.x,
						position.y, 
						pointDimensions.X,
					   	pointDimensions.Y);
			}
		}
		if(timeEnabled && !areOptionsEnabled){
			console.log('setting timeout',t);
			for (var i = drawTimeouts.length - 1; i >= 0; i--) {
				clearTimeout(drawTimeouts[i]);
			};
			drawTimeouts.push(setTimeout("jQuery(function($){draw("+(t+1).toString()+");});",100));
		}
	};
	window.draw = draw; //IM SORRY IT'S THE ONLY WAY I COULD GET IT TO WORK :(

	// draws all the pixels one by one, without hanging up the app
	var drawAnimation = function() {
		redFunc = $('#redFunc').val();
		greenFunc = $('#greenFunc').val();
		blueFunc = $('#blueFunc').val();

		// the index of the current pixel to be drawn
		var cursor = {
			x: -1,
			y: 0,
		}

		// sets the cursor to the index of the next pixel. if there are no
		// more pixels to be drawn, returns false. otherwise returns true
		var nextPixel = function() {
			cursor.x++;
			if (cursor.x >= displayDimensions.X) {
				console.log(0);
				cursor.x = 0;
				cursor.y++;
				
				if (cursor.y > displayDimensions.X + 1) {
					return false;
				}
			}
			return true;
		}

		// draws the next *amount* pixels to the screen. returns true if it drew 
		// all of the pixels, and false otherwise.
		var drawNext = function(amount) {
			var toReturn = false;

			for (var i = 0; i < amount; i++) {
				if (nextPixel()) {
					var position = getPixelPosition(cursor.x, cursor.y);

					if (useActualCoordinates) {	
						ctx.fillStyle = calcColor(position.x, position.y);
					}
					else {
						ctx.fillStyle = calcColor(cursor.x, cursor.y);
					}

					ctx.fillRect(
								position.x,
								position.y, 
								pointDimensions.X,
							   	pointDimensions.Y);

					toReturn = true;
					continue;
				}
				toReturn = false;
			}
			return toReturn;
		}

		// function that loops through every pixel, and draws it.
		var drawLoop = function() {
			if (drawNext(5000)) {
				setTimeout(drawLoop, 1);
			}
		}

		drawLoop();
	}

	$(window).keydown(function(e) {
		// if the escape key is pressed
		if (e.which == 27) {
			!areOptionsEnabled ? showDiv() : hideDiv();
			areOptionsEnabled = !areOptionsEnabled;
		}
		else if (e.which == 13 && !areOptionsEnabled) {
			onResize();
		}
	});
	
	$(window).resize(onResize);
	onResize();
});