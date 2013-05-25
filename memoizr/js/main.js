var Mz = Mz || {};

navigator.getMedia = (navigator.getUserMedia ||  
                      navigator.webkitGetUserMedia ||
                      navigator.mozGetUserMedia ||
                      navigator.msGetUserMedia);

// Number of frames per second
Mz.numFramesPerSecond = 10;
Mz.numFramesRendred = 0;

// Defining Difficulty level 
Mz.LEVELS = {
	LOW		: { value: 0, time: 2000, numPics: 6, maxAttepmts: 9 },
	MEDIUM	: { value: 1, time: 2000, numPics: 8, maxAttepmts: 12 },
	HIGH	: { value: 2, time: 2000, numPics: 10, maxAttepmts: 16 }
};

Mz.filters=[
              ["flipXY",{}],
              ["bulge",{}],
              ["pinch",{}],
              ["wave",{}],
              ["randomjitter",{}],
              ["pixelate",{pixelSize:5}]
          ];

// Initial filter
Mz.filterIdx = ~~(Math.random()*Mz.filters.length);

// By Default, Low level is selected
Mz.selectedLevel = Mz.LEVELS.LOW;

// Define the permissions we need for getUserMedia() API
Mz.gumVideoPermission = { video: true };

// Order of Snapshots
Mz.snapshotTimestamps = [];
Mz.numSnapshots = 0;

// Number of Attempts in test mode
Mz.numAttempts = 0;
Mz.successAttempts = 0;

// Success Messages
Mz.successMessageList = [
  'Awesome..You made the right selection',
  'Great Job........Keep doing good',
  'You are doing great..Thumbs up!!',
  'Nicely Done...Please continue'
];

Mz.failureMessageList = [
  'Oops..Wrong selection',
  'Please try again....',
  'Think better next time'
];

// Image preview container (Used in Test mode)
// Saving a global reference to avoid multiple DOM queries
Mz.previewCanvas = document.getElementById('image-preview-canvas');

// Define all event handlers here
$('.start-game').on('click', playVideo);
$('.restart-game').on('click', function() {
  window.location.reload();
});
$('.nav-option').on('click', changeGameLevel);
$('.thumbnail').on('click', updateAttempts);
$('.thumbnail').on('mouseover', showImagePreview);
$('.thumbnail').on('mouseout', hideImagePreview);

var video = null;
refreshObjects();

function playVideo() {
  $('#main-container').addClass('picture-mode');

	try {
		navigator.getMedia(Mz.gumVideoPermission, function(stream) {
			// Remove video object if already exists
			video = document.getElementById('video');
	     //video.mozSrcObject = stream;
      video.src = window.URL.createObjectURL(stream);

      video.onloadedmetadata = function() {
        video.play();
        startTakingPictures();
      };

	  }, function(error) {
	    alert('Your browser does not support getUserMedia API. Please get to latest Firefox');
	  });
	} catch (e) {
		// SHow message here. 
		alert('Unable to get access to your webcam. Please refresh your page and try again');
	}
}

function startTakingPictures() {
  if (video.videoWidth > 5) {
    Mz.inPictureMode = true;
  	var canvas = Mz.previewCanvas;
  	var ctx = canvas.getContext('2d');

  	canvas.width  = video.videoWidth/4;
  	canvas.height = video.videoHeight/4;
  	ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  	  	
    // Applying random filter on canvas
    var tData = ctx.createImageData(canvas.width-1,canvas.height-1);
    $filterjs.getFilter(Mz.filters[Mz.filterIdx][0])(ctx.getImageData(0,0,canvas.width-1,canvas.height-1),tData,Mz.filters[Mz.filterIdx][1]);
    ctx.putImageData(tData,0,0);

    // Check if we should take snapshot now
    var timeElapsed = (Mz.numFramesRendred * 1000)/Mz.numFramesPerSecond;
    if (timeElapsed % Mz.selectedLevel.time == 0) {
      captureSnapshot(canvas.toDataURL());
      console.log(timeElapsed);
    }

    Mz.numFramesRendred++;

  	if (Mz.numSnapshots <= Mz.selectedLevel.numPics) {
  		setTimeout(startTakingPictures, 1000/Mz.numFramesPerSecond);
  		return;
  	}

    enterTestMode();
  	video.pause();
    Mz.inPictureMode = false;
    video.src = null;
    console.log(Mz.numFramesRendred);
  } else {
    setTimeout(startTakingPictures, 1000);
    return;
  }
}

function captureSnapshot(imageSource) {
  var listItem = $('#item-' + Mz.numSnapshots).empty().addClass('thumbnail-present');
  var div = $('<div />').addClass('list-header');

  var userInputPositionSpan = $('<span />').addClass('user-input-position-span').appendTo(div);  
  var correctPositionSpan = $('<span />').text(Mz.numSnapshots).addClass('correct-position-span').appendTo(div);
  
  div.appendTo(listItem);
  var image = $('<img />').attr({'src': imageSource}).appendTo(listItem);
  Mz.numSnapshots++;

  // Choose another filter now
  Mz.filterIdx = ~~(Math.random()*Mz.filters.length);
}

function enterTestMode() {
  // Add class to container to hide/show respective elements on screen
  $('#main-container').removeClass('picture-mode').addClass('test-mode');

  Mz.inTestMode = true;

  shuffleImages();
}

function updateAttempts(e) {
  if (!Mz.inTestMode || Mz.isGameFinished) return;

  var elem = e.currentTarget;
  var $elem = (elem.tagName == 'LI') ? $(elem) : $(elem).parent('li.thumbnail');
  
  var correctPosition = $elem.find('.correct-position-span').text();
  
  Mz.numAttempts++;

  //$('#status').removeClass('alert-success').addClass('alert-error');

  if (correctPosition == Mz.successAttempts + 1) {
    Mz.successAttempts++;
    //TODO
    // $('#status').text().addClass('correct');
    $('#status').text(Mz.successMessageList[ getRandom() % Mz.successMessageList.length] )
                .addClass('alert-success').removeClass('alert-error');
    $('.correct-position-span', $elem).show();
  } else {
    $('#status').text(Mz.failureMessageList[ getRandom() % Mz.failureMessageList.length] )
                .removeClass('alert-success').addClass('alert-error');
  }

  $('#success-attempts').text(Mz.successAttempts);
  $('#num-attempts').text(Mz.numAttempts);


  if (Mz.successAttempts == Mz.selectedLevel.numPics) {
    finishGame(); 
  }
}

function finishGame() {
  if (Mz.numAttempts > Mz.selectedLevel.maxAttepmts) {
    $('#status').text('You took more attempts than expected..Try again').addClass('end-game-status-failure');
  } else {
    $('#status').text('You are impressive..Great Job').addClass('end-game-status-success');
  }

  $('#main-container').removeClass('preview-mode').addClass('test-mode');
  $('.restart-game').show();
  Mz.isGameFinished = true;
}

function shuffleImages() {
  var list = $('.thumbnail');

  // Randomized using Deck shuffle algorithm
  var length = Mz.selectedLevel.numPics;
  for (var i=1; i<=length; i++) {
    var randomIndex = Math.floor(Math.random() * (length - i+1) + i);
    swapHTML($('#item-' + i), $('#item-' + randomIndex));
  }
}

function swapHTML(elem1, elem2) {
  var html1 = $(elem1).html();
  var html2 = $(elem2).html();
  $(elem1).html(html2);
  $(elem2).html(html1);
}

function getRandom() {
	return new Date().getTime();
}

function changeGameLevel(event) {
  if (Mz.inPictureMode) {
    alert('Please wait until all pictures for this level are not taken');
    return;
  }

  $('.nav li.active').removeClass('active');
  $(event.currentTarget).addClass('active');
  var selectedLevel = $(event.currentTarget).data('level');
  setLevel(selectedLevel);
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
  video.src = null;
  
  Mz.snapshotTimestamps = [];
  Mz.numSnapshots = 0;

  Mz.numAttempts = 0;
  Mz.successAttempts = 0;

  Mz.inTestMode = false;
  Mz.inPictureMode = false;

  Mz.isGameFinished = false;

  Mz.numFramesRendred = 0;
  
  // Empty all the image tags
  for (var i=Mz.selectedLevel.numPics; i>0; i--) {
    $('#item-' + i).empty().removeClass('thumbnail-present');
  }

  $('#main-container').removeClass('picture-mode').removeClass('test-mode');
  $('#status').removeClass('end-game-status-success').removeClass('end-game-status-failure').text('Output');
  $('.restart-game').hide();
  $('#success-attempts').text(Mz.successAttempts);
  $('#num-attempts').text(Mz.numAttempts);
  var ctx = Mz.previewCanvas.getContext('2d');
  ctx.clearRect(0, 0, Mz.previewCanvas.width, Mz.previewCanvas.height);
}

function showImagePreview(e) {
  if (!Mz.inTestMode || Mz.isGameFinished) return;

  var image = $('img', e.currentTarget);
  if (image) {
    image = image.get(0);
    var context = Mz.previewCanvas.getContext('2d');
    context.drawImage(image, 0, 0, Mz.previewCanvas.width, Mz.previewCanvas.height);
    
    $('#main-container').removeClass('test-mode').addClass('preview-mode');
  }
}

function hideImagePreview(e) {
  if (!Mz.inTestMode || Mz.isGameFinished) return;

  $('#main-container').addClass('test-mode').removeClass('preview-mode');
}