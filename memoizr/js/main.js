var Mz = Mz || {};

// Defining Difficulty level 
Mz.LEVELS = {
	LOW		: { value: 0, time: 6000, numPics: 5 },
	MEDIUM	: { value: 1, time: 4000, numPics: 5 },
	HIGH	: { value: 2, time: 2000, numPics: 5 }
};

// By Default, Low level is selected
Mz.selectedLevel = Mz.LEVELS.LOW;

// Define the permissions we need for getUserMedia() API
Mz.gumVideoPermission = { video: true };

// Order of Snapshots
Mz.snapshotTimestamps = [];
Mz.numSnapshots = 0;

// Define all event handlers here
$('.start-game').on('click', playVideo);

var video = null;
function playVideo() {
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

var inputContainer = $('#input-row');
function startTakingPictures() {
	if (Mz.numSnapshots > Mz.selectedLevel.numPics) return;
	// Break recursion if number of snapshots are complete as per selected level

	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');

  	canvas.width  = video.videoWidth/4;
  	canvas.height = video.videoHeight/4;
  	ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  	  	
  	var rand = getRandom();
  	Mz.snapshotTimestamps.push(rand);
  	Mz.numSnapshots++;
  	canvas.setAttribute('data-index', rand);

  	$('<li>').addClass('thumbnail').append(canvas).appendTo(inputContainer);

  	if (Mz.numSnapshots <= Mz.selectedLevel.numPics) {
  		setTimeout(startTakingPictures, Mz.selectedLevel.time);
  		return;
  	}
  	video.pause();
}

function getRandom() {
	return new Date().getTime();
}