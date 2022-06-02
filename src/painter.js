var Painter = function(main){

	this.main = main;
	

	var game = this.main.game;
	

	this.DRAWING_AREA = new Phaser.Rectangle(842, 95, 416, 416);
		

	this.bmpOrigDrawing = game.make.bitmapData(this.DRAWING_AREA.width+2, this.DRAWING_AREA.height+2);
	this.bmpOrigDrawing.addToWorld(this.DRAWING_AREA.x-1, this.DRAWING_AREA.y-1);
		

	this.bmpCropDrawing = game.make.bitmapData(this.DRAWING_AREA.width, this.DRAWING_AREA.height);
	

	this.bmpDownSample1 = game.make.bitmapData(104, 104);
	

	this.bmpDownSample2 = game.make.bitmapData(52, 52);
	

	this.bmpFinalDrawing = game.make.bitmapData(28, 28);
	

	this.sprDisableEffect = game.add.sprite(this.DRAWING_AREA.x-1, this.DRAWING_AREA.y-1, 'imgDisable');
	this.sprDisableEffect.width = this.bmpOrigDrawing.width;
	this.sprDisableEffect.height = this.bmpOrigDrawing.height;
};

Painter.prototype.reset = function(){

	this.isDrawing = false;

	this.pencil = {x:0, y:0, prevX:0, prevY:0, left:0, top:0, right:0, bottom:0};
	

	this.cropArea = {left:2000, top:2000, right:-2000, bottom:-2000, width:0, height:0, tx:0, ty:0};
	

	this.bmpOrigDrawing.fill(255, 255, 255);
	this.bmpCropDrawing.fill(255, 255, 255);
	this.bmpFinalDrawing.fill(255, 255, 255);
};


Painter.prototype.enable = function(){
	this.sprDisableEffect.kill();
};


Painter.prototype.disable = function(){
	this.sprDisableEffect.revive();
};


Painter.prototype.draw = function(x, y){
	if (this.DRAWING_AREA.contains(x, y)){ 

		this.pencil.prevX = this.pencil.x;
		this.pencil.prevY = this.pencil.y;
					
		this.pencil.x = x - this.DRAWING_AREA.x;
		this.pencil.y = y - this.DRAWING_AREA.y;
					
		this.pencil.left = this.pencil.x - 5;
		this.pencil.top = this.pencil.y - 5;
		this.pencil.right = this.pencil.x + 5;
		this.pencil.bottom = this.pencil.y + 5;
					

		this.bmpOrigDrawing.circle(this.pencil.x, this.pencil.y, 4, '#000');
					
		if (!this.isDrawing){

			this.isDrawing = true;
						
		} else {

			var xc = (this.pencil.prevX + this.pencil.x) / 2;
			var yc = (this.pencil.prevY + this.pencil.y) / 2;
						
			var ctx = this.bmpOrigDrawing.context;
						
			ctx.beginPath();

			ctx.quadraticCurveTo(this.pencil.prevX, this.pencil.prevY, xc, yc);
			ctx.quadraticCurveTo(xc, yc, this.pencil.x, this.pencil.y);
						
			ctx.lineWidth = 9;
			ctx.strokeStyle = '#000';
			ctx.stroke();

			ctx.closePath();
		}
					

		if (this.pencil.left < this.cropArea.left){
			this.cropArea.left = this.pencil.left;
			if (this.cropArea.left < 0) this.cropArea.left = 0;
		}
			
		if (this.pencil.right > this.cropArea.right){
			this.cropArea.right = this.pencil.right;
			if (this.cropArea.right > this.DRAWING_AREA.width) this.cropArea.right = this.DRAWING_AREA.width;
		}
			
		if (this.pencil.top < this.cropArea.top){
			this.cropArea.top = this.pencil.top;
			if (this.cropArea.top < 0) this.cropArea.top = 0;
		}
				
		if (this.pencil.bottom > this.cropArea.bottom){
			this.cropArea.bottom = this.pencil.bottom;
			if (this.cropArea.bottom > this.DRAWING_AREA.height) this.cropArea.bottom = this.DRAWING_AREA.height;
		}
		
		this.cropArea.width = this.cropArea.right - this.cropArea.left;
		this.cropArea.height = this.cropArea.bottom - this.cropArea.top;
		
		this.cropArea.tx = 0;
		this.cropArea.ty = 0;
		
		if (this.cropArea.width > this.cropArea.height){
			this.cropArea.ty = (this.cropArea.width - this.cropArea.height)/2;
		}
			
		if (this.cropArea.width < this.cropArea.height){
			this.cropArea.tx = (this.cropArea.height - this.cropArea.width)/2;
		}
		

		this.resizeDrawing();
		
	} 
	// 마우스가 페인터 밖으로 벗어났을 때 분석하는 부분
	// 제출했을 때만 분석해야하므로 주석처리
	//else { 
	//	this.recognize();
	//}
};


Painter.prototype.resizeDrawing = function(){

	this.bmpCropDrawing.resize(
		this.cropArea.width + this.cropArea.tx * 2, 
		this.cropArea.height + this.cropArea.ty * 2
	);


	this.bmpCropDrawing.fill(255, 255, 255);
	

	this.bmpCropDrawing.copy(
		this.bmpOrigDrawing, 
		this.cropArea.left, this.cropArea.top, 
		this.cropArea.width, this.cropArea.height,
		this.cropArea.tx, this.cropArea.ty
	);
	

	this.bmpDownSample1.copy(this.bmpCropDrawing, null, null, null, null, 0, 0, 104, 104);
	

	this.bmpDownSample2.copy(this.bmpDownSample1, null, null, null, null, 0, 0, 52, 52);
	

	this.bmpFinalDrawing.copy(this.bmpDownSample2, null, null, null, null, 1, 1, 26, 26);
};


Painter.prototype.recognize = function(){
	if (this.isDrawing){ 
		this.bmpFinalDrawing.update();
				

		var aPixels = Float32Array.from(
			this.bmpFinalDrawing.pixels.map(function (cv){return cv & 255;})
		);
		

		var aNormalizedPixels = aPixels.map(function (cv){return (255-cv)/255.0;});
		

		this.main.cnn.predictDoodle(aNormalizedPixels);
						

		this.isDrawing = false;
	}
};