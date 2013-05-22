var Mz = Mz || {};

// Defining Difficulty level 
Mz.LEVELS = {
	LOW		: { value: 0, time: 3000, numPics: 6 },
	MEDIUM	: { value: 1, time: 3000, numPics: 8 },
	HIGH	: { value: 2, time: 3000, numPics: 10 }
};

Mz.filters=[
              ["flipXY",{}],
              ["bulge",{}],
              ["pinch",{}],
              ["wave",{}],
              ["randomjitter",{}],
              ["pixelate",{pixelSize:5}]
          ];

// By Default, Low level is selected
Mz.selectedLevel = Mz.LEVELS.LOW;

// Define the permissions we need for getUserMedia() API
Mz.gumVideoPermission = { video: true };

// Order of Snapshots
Mz.snapshotTimestamps = [];
Mz.numSnapshots = 0;

// Define all event handlers here
$('.start-game').on('click', playVideo);
$('.nav-option').on('click', changeGameLevel);

var video = null;
function playVideo() {
  
  refreshObjects();
	try {
		window.navigator.mozGetUserMedia(Mz.gumVideoPermission, function(stream) {
			// Remove video object if already exists
			video = document.getElementById('video');
	        video.mozSrcObject = stream;
	        video.play();
	        startTakingPictures();
	    }, function(error) {
	    	alert('Your browser does not support getUserMedia API. Please get to latest Firefox');
	    });
	} catch (e) {
		// SHow message here. 
		alert('Error caught in catch' + e);
	}
}

function startTakingPictures() {
	// Break recursion if number of snapshots are complete as per selected level
  if (Mz.numSnapshots > Mz.selectedLevel.numPics) return;
	
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');

	canvas.width  = video.videoWidth/4;
	canvas.height = video.videoHeight/4;
	ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
	  	
  // Applying random filter on canvas
  var tData = ctx.createImageData(canvas.width-1,canvas.height-1);
  var filterIdx = ~~(Math.random()*Mz.filters.length);
  $filterjs.getFilter(Mz.filters[filterIdx][0])(ctx.getImageData(0,0,canvas.width-1,canvas.height-1),tData,Mz.filters[filterIdx][1]);

  var rand = getRandom();
  Mz.snapshotTimestamps.push(rand);
  ctx.putImageData(tData,0,0);

  console.log(tData);
  console.log(Mz.numSnapshots);

  var image = $('<img />').attr({'src': canvas.toDataURL(), 'data-index': rand}); 
	$('#item-' + Mz.numSnapshots).empty().append(image);

  Mz.numSnapshots++;
	if (Mz.numSnapshots <= Mz.selectedLevel.numPics) {
		setTimeout(startTakingPictures, Mz.selectedLevel.time);
		return;
	}
	video.pause();
}

function getRandom() {
	return new Date().getTime();
}

function changeGameLevel(event) {
  $('.nav li.active').removeClass('active');
  $(event.currentTarget).addClass('active');
  var selectedLevel = $(event.currentTarget).data('level');
  setLevel(selectedLevel);
  console.log(selectedLevel);
}

function setLevel(selectedLevel) {
  $('#main-container').removeClass('low').removeClass('medium').removeClass('high').addClass(selectedLevel);
  Mz.selectedLevel = Mz.LEVELS[selectedLevel.toUpperCase()];
  console.log(Mz.selectedLevel);
  refreshObjects();
}

function refreshObjects() {
  video = document.getElementById('video');
  video.mozSrcObject = null;
  
  Mz.snapshotTimestamps = [];
  Mz.numSnapshots = 0;
  
  // Empty all the image tags
  for (var i=Mz.selectedLevel.numPics; i>0; i--) {
    $('#item-' + i).empty();
  }
}