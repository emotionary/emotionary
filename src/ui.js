var UI = function(main){

	this.main = main;
	

	var game = this.main.game;
	

	this.btnTrain = game.add.button(460, 625, 'btnTrain', this.onTrainClick, this);
	this.btnTest = game.add.button(652, 625, 'btnTest', this.onTestClick, this);
	this.btnClear = game.add.button(842, 625, 'btnClear', this.onClearClick, this);
	this.btnMoreGames = game.add.button(1048, 625, 'btnMoreGames', this.onMoreGamesClick, this);
	
	this.btnAuthor = game.add.button(1130, 703, 'btnAuthor', this.onMoreGamesClick, this);
	this.btnAuthor.anchor.setTo(0.5);
	

	this.bmpAccuChart = game.add.bitmapData(350, 250);
	this.bmpAccuChart.addToWorld(45, 95);
	

	this.bmpLossChart = game.add.bitmapData(350, 250);
	this.bmpLossChart.addToWorld(45, 410);
	

	this.bmpSampleImages = game.add.bitmapData(28, (28+4) * App.NUM_SAMPLES);
	this.bmpSampleImages.addToWorld(470, 95);
		

	this.bmpSampleResults = game.add.bitmapData(125, (28+4) * App.NUM_SAMPLES);
	this.bmpSampleResults.addToWorld(665, 95);
		

	this.txtSampleClasses = [];	
	this.txtSamplePredictions = [];	
		
	for (var i=0; i<App.NUM_SAMPLES; i++){
		var y = 100 + i*32;
			
		this.txtSampleClasses.push(
			game.add.bitmapText(550, y, "fntBlackChars", "", 18)
		);
		
		this.txtSamplePredictions.push(
			game.add.bitmapText(670, y, "fntBlackChars", "", 18)
		);
	}
		

	this.txtStatBar = game.add.bitmapText(10, 695, "fntBlackChars", "", 18);

	this.txtDoodlePrediction = game.add.bitmapText(1050, 572, "fntBlackChars", "", 36);
	this.txtDoodlePrediction.anchor.setTo(0.5);
};




UI.prototype.disableButtons = function(){
	this.btnTrain.kill();
	this.btnTest.kill();
	this.btnClear.kill();
};


UI.prototype.enableButtons = function(){
	this.btnTrain.revive();
	this.btnTest.revive();
	this.btnClear.revive();
};


UI.prototype.onTrainClick = function(){
	if (this.main.mode == this.main.MODE_DRAW){
		this.main.mode = this.main.MODE_CLICK_ON_TRAIN;
	}
};


UI.prototype.onTestClick = function(){
	if (this.main.mode == this.main.MODE_DRAW){
		this.main.mode = this.main.MODE_CLICK_ON_TEST;
	}
};


UI.prototype.onClearClick = function(){
	if (this.main.mode == this.main.MODE_DRAW){
		this.main.mode = this.main.MODE_CLICK_ON_CLEAR;
	}
};


UI.prototype.onMoreGamesClick = function(){
	window.open("http://www.askforgametask.com", "_blank");
};


UI.prototype.plotChart = function(bmpChart, aValues, dx){
	bmpChart.clear();
		
	for (var i = 1; i < aValues.length; i++){
		var x1 = (i-1) * dx;
		var y1 = bmpChart.height * aValues[i-1];
		
		var x2 = i * dx;
		var y2 = bmpChart.height * aValues[i];
		
		bmpChart.line(x1, y1, x2, y2, '#61bc6d', 2);
	}
};


UI.prototype.drawSampleImages = function(){

	this.bmpSampleImages.clear();
	

	var sample = this.main.cnn.testElement;
	

	for (var n = 0; n < App.NUM_SAMPLES; n++){

		sample = (sample + 1) % this.main.cnn.aTestIndices.length;
		

		var index = this.main.cnn.aTestIndices[sample];
		var start = index * this.main.cnn.IMAGE_SIZE;
	

		for (var i = 0; i < this.main.cnn.IMAGE_SIZE; i++){

			var pixel = this.main.cnn.aTestImages[i + start];
			var color = 255 - ((pixel * 255)>>0) & 0xFF;
			

			var x = i%28;
			var y = (i/28)>>0;						
			

			this.bmpSampleImages.setPixel32(x, y + n*32, color, color, color, 255, false);
		}
	}
	

	this.bmpSampleImages.context.putImageData(this.bmpSampleImages.imageData, 0, 0);
};


UI.prototype.showSamplePredictions = function(aClassifications, aPredictions){
	this.bmpSampleResults.clear();
			
	for (var i=0; i<aClassifications.length; i++){

		this.txtSampleClasses[i].text = App.DATASETS[aClassifications[i]];
		

		this.txtSamplePredictions[i].text = App.DATASETS[aPredictions[i]];
				

		var color = (this.txtSampleClasses[i].text === this.txtSamplePredictions[i].text) ? '#61bc6d' : '#e24939';
		this.bmpSampleResults.rect(0, 2 + i*32, this.bmpSampleResults.width, 24, color);
	}
};


UI.prototype.showDoodlePrediction = function(aPredictions){
	this.txtDoodlePrediction.text = "It's "  + App.DATASETS[aPredictions[0]] + ".";
};


UI.prototype.showStatusBar = function(strText){
	this.txtStatBar.text = strText;
};
