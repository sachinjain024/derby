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

// Number of Attempts in test mode
Mz.numAttempts = 0;
Mz.successAttempts = 0;

// Define all event handlers here
$('.start-game').on('click', playVideo);
$('.nav-option').on('click', changeGameLevel);
$('.thumbnail').on('click', updateAttempts);

var video = null;
function playVideo() {
  
  refreshObjects();
	try {
		window.navigator.mozGetUserMedia(Mz.gumVideoPermission, function(stream) {
			// Remove video object if already exists
			video = document.getElementById('video');
	        video.mozSrcObject = stream;
	        video.play();
          Mz.inTestMode = false;
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

  var listItem = $('#item-' + Mz.numSnapshots).empty().addClass('thumbnail-present');
  var div = $('<div />').addClass('list-header');

  var userInputPositionSpan = $('<span />').addClass('user-input-position-span').appendTo(div);  
  var correctPositionSpan = $('<span />').text(Mz.numSnapshots).addClass('correct-position-span').appendTo(div);
  
  div.appendTo(listItem);
  var image = $('<img />').attr({'src': canvas.toDataURL(), 'data-index': rand}).appendTo(listItem);
  
  Mz.numSnapshots++;
	if (Mz.numSnapshots <= Mz.selectedLevel.numPics) {
		setTimeout(startTakingPictures, Mz.selectedLevel.time);
		return;
	}
  enterTestMode();
	video.pause();
}

function enterTestMode() {
  // Add class to container to hide/show respective elements on screen
  $('#main-container').removeClass('picture-mode').addClass('test-mode');

  Mz.inTestMode = true;

  shuffleImages();
}

function updateAttempts(e) {
  if (!Mz.inTestMode) return;

  var elem = e.currentTarget;
  var $elem = (elem.tagName == 'LI') ? $(elem) : $(elem).parent('li.thumbnail');
  
  var correctPosition = $elem.find('.correct-position-span').text();
  
  Mz.numAttempts++;

  if (correctPosition == Mz.successAttempts + 1) {
    Mz.successAttempts++;
    $('#status').text('Correct -- :)');
    $('.correct-position-span', $elem).show();
  } else {
    $('#status').text('Incorrect attempt..Try again -- :)');
  }

  $('#success-attempts').text(Mz.successAttempts);
  $('#num-attempts').text(Mz.numAttempts);
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
  if (!Mz.inTestMode) {
    alert('Please wait until all pictures for this level are not taken');
    return;
  }

  $('.nav li.active').removeClass('active');
  $(event.currentTarget).addClass('active');
  var selectedLevel = $(event.currentTarget).data('level');
  setLevel(selectedLevel);
  // console.log(selectedLevel);
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
    $('#item-' + i).empty().removeClass('thumbnail-present');
  }

  $('#main-container').addClass('picture-mode').removeClass('test-mode');
}