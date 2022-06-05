var CNN = function(main){

	this.main = main;
	
	this.NUM_CLASSES = App.DATASETS.length; 
	
	this.IMAGE_SIZE = 784; 
	
	this.NUM_TRAIN_IMAGES = 400; 
	this.NUM_TEST_IMAGES = 100; 
	
	this.TRAIN_ITERATIONS = 50; 
	this.TRAIN_BATCH_SIZE = 100; 

	this.TEST_FREQUENCY = 5; 
	this.TEST_BATCH_SIZE = 50; 
	
	this.trainIteration = 0; 
	
	this.aLoss = []; 
	this.aAccu = []; 
	

	const TOTAL_TRAIN_IMAGES = this.NUM_CLASSES * this.NUM_TRAIN_IMAGES;
	

	const TOTAL_TEST_IMAGES = this.NUM_CLASSES * this.NUM_TEST_IMAGES;
	

	this.aTrainImages = new Float32Array(TOTAL_TRAIN_IMAGES * this.IMAGE_SIZE);
	this.aTrainClasses = new Uint8Array(TOTAL_TRAIN_IMAGES);
	

	this.aTrainIndices = tf.util.createShuffledIndices(TOTAL_TRAIN_IMAGES);
	

	this.trainElement = -1;
					

	this.aTestImages = new Float32Array(TOTAL_TEST_IMAGES * this.IMAGE_SIZE);
	this.aTestClasses = new Uint8Array(TOTAL_TEST_IMAGES);
	

	this.aTestIndices = tf.util.createShuffledIndices(TOTAL_TEST_IMAGES);


	this.testElement = -1;


	this.model = tf.sequential();


	this.model.add(tf.layers.conv2d({
		inputShape: [28, 28, 1],
		kernelSize: 5,
		filters: 8,
		strides: 1,
		activation: 'relu',
		kernelInitializer: 'varianceScaling'
	}));
	

	this.model.add(tf.layers.maxPooling2d({
		poolSize: [2, 2], 
		strides: [2, 2]
	}));
	

	this.model.add(tf.layers.conv2d({
		kernelSize: 5,
		filters: 16,
		strides: 1,
		activation: 'relu',
		kernelInitializer: 'varianceScaling'
	}));
	

	this.model.add(tf.layers.maxPooling2d({
		poolSize: [2, 2], 
		strides: [2, 2]
	}));
	

	this.model.add(tf.layers.flatten());
	

	this.model.add(tf.layers.dense({
		units: this.NUM_CLASSES, 
		kernelInitializer: 'varianceScaling', 
		activation: 'softmax'
	}));
	

	this.model.compile({
		optimizer: tf.train.sgd(0.15), 
		loss: 'categoricalCrossentropy', 
		metrics: ['accuracy'], 
	});
};


CNN.prototype.splitDataset = function(imagesBuffer, dataset){
	
	var trainBuffer = new Float32Array(imagesBuffer.slice(0, this.IMAGE_SIZE * this.NUM_TRAIN_IMAGES));
	trainBuffer = trainBuffer.map(function (cv){return cv/255.0});
	
	
	var start = dataset * this.NUM_TRAIN_IMAGES;
	this.aTrainImages.set(trainBuffer, start * this.IMAGE_SIZE);
	this.aTrainClasses.fill(dataset, start, start + this.NUM_TRAIN_IMAGES);
	
	
	var testBuffer = new Float32Array(imagesBuffer.slice(this.IMAGE_SIZE * this.NUM_TRAIN_IMAGES));
	testBuffer = testBuffer.map(function (cv){return cv/255.0});
	
	
	start = dataset * this.NUM_TEST_IMAGES;
	this.aTestImages.set(testBuffer, start * this.IMAGE_SIZE);
	this.aTestClasses.fill(dataset, start, start + this.NUM_TEST_IMAGES);
};


CNN.prototype.train = async function(){
	
	this.isTrainCompleted = false;
						
	for (let i = 0; i < this.TRAIN_ITERATIONS; i++){
		
		this.trainIteration++;
		this.main.ui.showStatusBar("Training the CNN - iteration " + this.trainIteration + ".");
		
		
		let trainBatch = this.nextTrainBatch(this.TRAIN_BATCH_SIZE);
		
		
		let testBatch;
		let validationSet;
				
		if (i % this.TEST_FREQUENCY === 0){ 
			testBatch = this.nextTestBatch(this.TEST_BATCH_SIZE);
			
			validationSet = [testBatch.images, testBatch.labels];
		}
		

		const training = await this.model.fit(
			trainBatch.images,
			trainBatch.labels,
			{batchSize: this.TRAIN_BATCH_SIZE, validationData: validationSet, epochs: 1}
		);


		var maxLossLength = this.main.ui.bmpLossChart.width;
		if (this.aLoss.length > maxLossLength) this.aLoss.shift();
		this.aLoss.push(1 - Math.min(1, training.history.loss[0]));
		this.main.ui.plotChart(this.main.ui.bmpLossChart, this.aLoss, 1);
		
		if (testBatch != null) {

			var maxAccuLength = this.main.ui.bmpAccuChart.width;
			if (this.aAccu.length * this.TEST_FREQUENCY > maxAccuLength) this.aAccu.shift();
			this.aAccu.push(1 - Math.min(1, training.history.acc[0]));
			this.main.ui.plotChart(this.main.ui.bmpAccuChart, this.aAccu, this.TEST_FREQUENCY);
			

			testBatch.images.dispose();
			testBatch.labels.dispose();
		}
		

		trainBatch.images.dispose();
		trainBatch.labels.dispose();


		await tf.nextFrame();
	}
	

	this.isTrainCompleted = true;
};


CNN.prototype.predictSamples = async function(){
	this.isSamplesPredicted = false;

	const samplesBatch = this.nextTestBatch(App.NUM_SAMPLES);

	tf.tidy(() => {
		const output = this.model.predict(samplesBatch.images);
		
		const aClassifications = Array.from(samplesBatch.labels.argMax(1).dataSync());
		const aPredictions = Array.from(output.argMax(1).dataSync());
		
		this.main.ui.showSamplePredictions(aClassifications, aPredictions);
	});
	
	tf.dispose(samplesBatch);
	
	this.isSamplesPredicted = true;
};
	
// 기존 predictDoodle
CNN.prototype.predictDoodle = async function(aNormalizedPixels){		
	const input = tf.tensor2d(aNormalizedPixels, [1, this.IMAGE_SIZE]);
		
	tf.tidy(() => {
		const output = this.model.predict(
			input.reshape([1, 28, 28, 1])
		);
		
		const aPrediction = Array.from(output.argMax(1).dataSync());
		
		this.main.ui.showDoodlePrediction(aPrediction);
	});
	
	tf.dispose(input);
};


// 텍스트 + 이모티콘 출력할 수 있도록 predictDoodle 수정
CNN.prototype.predictDoodle2 = async function(aNormalizedPixels){		
	const input = tf.tensor2d(aNormalizedPixels, [1, this.IMAGE_SIZE]);
		
	tf.tidy(() => {
		const output = this.model.predict(
			input.reshape([1, 28, 28, 1])
		);
		
		const aPrediction = Array.from(output.argMax(1).dataSync());
		
		// aPrediction[0] : 0~9까지의 결과값 	ex) aPrediction[0] : 4
		// App.DATASETS 데이터셋이 들어가있는 배열 
		// App.DATASETS[숫자값] : main.js에서 정의했던 문자열

		// 텍스트 결과 처리 
		this.main.ui.showStatusBar("This is how I guessed! Is it right?"); // 결과 상태바
		this.main.ui.showDoodlePrediction(aPrediction);

		// 이모티콘 결과 처리
		// 수정하는 법 : aPrediction[0]값을 showEmoticon에 인자로 넘겨주고, showEmoticon에 ifelse 달아주기
		this.main.painter.showEmoticon(aPrediction);
	
	});
	
	tf.dispose(input);
};



CNN.prototype.nextTrainBatch = function(batchSize){
	return this.fetchBatch(
		batchSize, this.aTrainImages, this.aTrainClasses, 
		() => {
			this.trainElement = (this.trainElement + 1) % this.aTrainIndices.length;
			return this.aTrainIndices[this.trainElement];
		}
	);
};


CNN.prototype.nextTestBatch = function(batchSize){
	return this.fetchBatch(
		batchSize, this.aTestImages, this.aTestClasses, 
		() => {
			this.testElement = (this.testElement + 1) % this.aTestIndices.length;
			return this.aTestIndices[this.testElement];
		}
	);
};


CNN.prototype.fetchBatch = function(batchSize, aImages, aClasses, getIndex){

	const batchImages = new Float32Array(batchSize * this.IMAGE_SIZE);
	const batchLabels = new Uint8Array(batchSize * this.NUM_CLASSES);

	for (let i = 0; i < batchSize; i++){

		const idx = getIndex();
		

		const image = aImages.slice(idx * this.IMAGE_SIZE, (idx + 1) * this.IMAGE_SIZE);
		

		batchImages.set(image, i * this.IMAGE_SIZE);


		const class_num = aClasses[idx];
		

		const label = new Uint8Array(this.NUM_CLASSES);
		label[class_num] = 1;
		

		batchLabels.set(label, i * this.NUM_CLASSES);
	}


	const images_temp = tf.tensor2d(batchImages, [batchSize, this.IMAGE_SIZE]);

	const images = images_temp.reshape([batchSize, 28, 28, 1]);
	

	images_temp.dispose();
	

	const labels = tf.tensor2d(batchLabels, [batchSize, this.NUM_CLASSES]);

	return {images, labels};
};