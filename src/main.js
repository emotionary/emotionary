window.onload = function () {	

	var game = new Phaser.Game(1280, 720, Phaser.CANVAS);
	
	game.state.add('MainState', App.MainState);
	
	game.state.start('MainState');
};


var App = App || {};


App.DATASETS = ['apple', 'carrot', 'butterfly', 'scissors', 'zebra', 'flower', 'eye', 'rabbit', 'snowflake', 'pizza'];

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
	
	//모드 추가 (12,13)
	this.MODE_DRAW_SUBMIT = 12;
	this.MODE_DO_DRAW_SUBMIT = 13;

	this.mode = this.MODE_INIT;
	
	this.dataset = 0;
};



App.MainState.prototype = {

	preload : function(){
		// 이모티콘 테스트 파일
		this.game.load.image('Apple', '../assets/emoji_apple.png');
		this.game.load.image('Carrot', '../assets/emoji_carrot.png');
		this.game.load.image('Butterfly', '../assets/emoji_butterfly.png');
		this.game.load.image('Scissors', '../assets/emoji_scissors.png');
		this.game.load.image('Zebra', '../assets/emoji_zebra.png');
		this.game.load.image('Flower', '../assets/emoji_flower.png');
		this.game.load.image('Eye', '../assets/emoji_eye.png');
		this.game.load.image('Rabbit', '../assets/emoji_rabbit.png');
		this.game.load.image('Snowflake', '../assets/emoji_snowflake.png');
		this.game.load.image('Pizza', '../assets/emoji_pizza.png');

		this.game.load.image('imgBack', '../assets/img_back_8.png');
		this.game.load.image('imgDisable', '../assets/img_disable.png');
		
		this.game.load.image('btnTrain', '../assets/btn_train.png');
		this.game.load.image('btnTest', '../assets/btn_test.png');
		this.game.load.image('btnClear', '../assets/btn_clear.png');
		this.game.load.image('btnSubmit', '../assets/btn_submit.png');
		
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
				this.ui.disableSubmitButton(); // submit 버튼 비활성화

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
				this.ui.disableSubmitButton(); // submit 버튼 비활성화
					
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
					this.ui.enableSubmitButton(); // submit 버튼 활성화
					
					this.ui.showStatusBar(
						"Draw " + App.DATASETS.join(", ") + 
						" to recognize your drawing!"
					);
					
					this.mode = this.MODE_DRAW;
				}
				break;
				

			case this.MODE_DRAW:
				this.ui.showStatusBar( // 클리어 버튼 눌렀을 때 상태바
					"Draw " + App.DATASETS.join(", ") + 
					" to recognize your drawing!"
				);

				if (this.game.input.mousePointer.isDown){
					this.painter.draw(this.game.input.x, this.game.input.y);
					
				} else {
					//제출 눌렀을때 분석하도록 변경할것이므로 일단 주석처리
					//this.painter.recognize();

					// 마우스다운 상태가 아닐 때는 isDrawing이 false여야 stroke 되지 않음
					this.painter.isDrawing = false;
				}

				break;
				

			// 제출 버튼 눌렀을때 (추가한 모드)
			case this.MODE_DRAW_SUBMIT:
				//this.ui.showStatusBar("MODE : this.MODE_DRAW_SUBMIT");

				this.painter.isDrawing = true; // recognize 실행 위해 isDrawing을 true로 전환

				// this.painter.recognize(); // 기존 : 마우스 다운 기준으로 분석
											// -> 변경 : 제출 버튼 누르면 분석

				this.painter.recognize2(); ////// 텍스트 + 이모티콘 출력까지 해주도록 recognize 수정

				this.mode = this.MODE_DO_DRAW_SUBMIT; // 제출 후 UI 수정사항 위해 모드 변경
				break;
			
			
			// 그림 분석 중 버튼, UI 수정 (추가한 모드)
			case this.MODE_DO_DRAW_SUBMIT:

				this.ui.disableSubmitButton(); // submit 버튼 비활성화

				// this.ui.showStatusBar("MODE : this.MODE_DO_DRAW_SUBMIT");
				this.painter.isDrawing = false; // recognize가 계속 실행되지 않도록 isDrawing을 false로 전환
				break;
			
			case this.MODE_CLICK_ON_TRAIN:
				this.mode = this.MODE_START_TRAIN;
				break;
			

			case this.MODE_CLICK_ON_TEST:
				this.mode = this.MODE_START_PREDICT;
				break;
			


			case this.MODE_CLICK_ON_CLEAR:
				this.painter.reset(); // 페인터 리셋
				this.ui.txtDoodlePrediction.setText(""); // 텍스트 리셋
				
				if(this.painter.testing){
					this.painter.clearEmoticon(); // 이모티콘 삭제
				}
				
				this.ui.enableSubmitButton(); // submit 버튼 활성화

				this.mode = this.MODE_DRAW;
				break;
		}
	}
};