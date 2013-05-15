var Mz = Mz || {};

// Defining Difficulty level 
Mz.LEVELS = {
	LOW		: { value: 0, time: 6, numPics: 5 }
	MEDIUM	: { value: 1, time: 4, numPics: 5 }
	HIGH	: { value: 2, time: 2, numPics: 5 }
};

// By Default, Low level is selected
Mz.selectedLevel = Mz.LEVELS.LOW;