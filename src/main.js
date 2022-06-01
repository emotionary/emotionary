window.onload = function () {	

	var game = new Phaser.Game(1280, 720, Phaser.CANVAS);
	
	game.state.add('MainState', App.MainState);
	
	game.state.start('MainState');
};


var App = App || {};


App.DATASETS = ['bee', 'candle', 'car', 'clock', 'fish', 'guitar', 'octopus', 'snowman', 'tree', 'umbrella'];

App.NUM_SAMPLES = 16;


App.MainState = function(){

	this.MODE_INIT = 1;
	this.MODE_OPEN_FILE = 2;
	this.MODE_LOAD_FILE = 3;
	this.MODE_START_TRAIN = 4;
	this.MODE_DO_TRAIN = 5;
	this.MODE_START_PREDICT = 6;
	this.MODE_DO_PREDICT = 7;
	this.MODE_DRAW = 8;
	this.MODE_CLICK_ON_TRAIN = 9;
	this.MODE_CLICK_ON_TEST = 10;
	this.MODE_CLICK_ON_CLEAR = 11;
	
	this.mode = this.MODE_INIT;
	
	this.dataset = 0;
};



App.MainState.prototype = {

	preload : function(){
		this.game.load.image('imgBack', '../assets/img_back_7.png');
		this.game.load.image('imgDisable', '../assets/img_disable.png');
		
		this.game.load.image('btnTrain', '../assets/btn_train.png');
		this.game.load.image('btnTest', '../assets/btn_test.png');
		this.game.load.image('btnClear', '../assets/btn_clear.png');
		this.game.load.image('btnMoreGames', '../assets/btn_moregames.png');
		this.game.load.image('btnAuthor', '../assets/btn_author.png');
		
		this.load.bitmapFont('fntBlackChars', '../assets/fnt_black_chars.png', '../assets/fnt_black_chars.fnt');
	},
	

	create : function(){

		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignVertically = true;
		this.scale.pageAlignHorizontally = true;
		

		this.game.stage.disableVisibilityChange = true;

		this.game.add.sprite(0, 0, 'imgBack');

		this.loader = new Phaser.Loader(this.game);
		

		this.ui = new UI(this);
		
		this.cnn = new CNN(this);
		
		this.painter = new Painter(this);
	},
	

	update : function(){
		switch(this.mode){

			case this.MODE_INIT:
				this.painter.reset();
				this.painter.disable();
				this.ui.disableButtons();
				
				this.mode = this.MODE_OPEN_FILE;
				break;
				

			case this.MODE_OPEN_FILE:
				var fileName = App.DATASETS[this.dataset] + '.bin';
				
				this.loader.reset();
				this.loader.binary('input_file', '../data/'+fileName);
				this.loader.start();
				
				this.ui.showStatusBar("Loading " + fileName + " file.");

				this.mode = this.MODE_LOAD_FILE;
				break;
				

			case this.MODE_LOAD_FILE:		
				if (this.loader.hasLoaded){

					this.cnn.splitDataset(
						new Uint8Array(this.game.cache.getBinary('input_file')),
						this.dataset
					);

					this.dataset++;

					if (this.dataset < App.DATASETS.length){
						this.mode = this.MODE_OPEN_FILE;
						
					} else {
						this.ui.showStatusBar("Initializing training.");
						this.mode = this.MODE_START_TRAIN;
					}
				}
				break;


			case this.MODE_START_TRAIN:
				this.painter.disable();
				this.ui.disableButtons();
					
				this.cnn.train();
				
				this.mode = this.MODE_DO_TRAIN;				
				break;
				

			case this.MODE_DO_TRAIN:
				if (this.cnn.isTrainCompleted){
					this.ui.showStatusBar("Training completed. Predicting samples...");
					
					this.mode = this.MODE_START_PREDICT;
				}
				break;

			case this.MODE_START_PREDICT:
				this.ui.drawSampleImages();
				this.cnn.predictSamples();
				
				this.mode = this.MODE_DO_PREDICT;
				break;
				

			case this.MODE_DO_PREDICT:
				if (this.cnn.isSamplesPredicted){
					this.painter.enable();
					this.ui.enableButtons();
					
					this.ui.showStatusBar(
						"Draw " + App.DATASETS.join(", ") + 
						" to recognize your drawing!"
					);
					
					this.mode = this.MODE_DRAW;
				}
				break;
				

			case this.MODE_DRAW:
				if (this.game.input.mousePointer.isDown){
					this.painter.draw(this.game.input.x, this.game.input.y);
					
				} else {
					this.painter.recognize();
				}

				break;
				

			case this.MODE_CLICK_ON_TRAIN:
				this.mode = this.MODE_START_TRAIN;
				break;
			
			case this.MODE_CLICK_ON_TEST:
				this.mode = this.MODE_START_PREDICT;
				break;
				

			case this.MODE_CLICK_ON_CLEAR:
				this.painter.reset();
				this.ui.txtDoodlePrediction.setText("");
				
				this.mode = this.MODE_DRAW;
				break;
		}
	}
};
