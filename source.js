// 
// @author : 
//             Banaj Bedi
//             Chandan Kansal 
// 


const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const DEBUG = false;

// If you are strategizing on debugging your application, 
// you'll generally want the debug attribute to be set to "true". 
// If you are planning on compiling your application for release (i.e. being ready for actual released and deployment), 
// it's generally better to not have the debug attribute (or have it set to false).
// Not Setting the debug option will allow the compiler to take advantage of various performance tweaks 
// since it won't need to worry about any possibly debugging and it can build a more optimized application.


// configure parameters to set for the bodypix model.
const bodyPixProperties = {
    architecture: 'ResNet50',
    outputStride: 16,
    quantBytes: 4
  };

// Architecture  :- Can be either MobileNetV1 or ResNet50.
// Output stride :- Can be for MobileNetV1(8,16) and for ResNet(16,32) The smaller the value, the larger the output resolution,
//                  and more accurate the model at the cost of speed.
// Multiplier    :- Only used by MobileNetV1 architecture can be 1.00 0.75 or 0.50
// Quant bytes   :- This argument controls the bytes used for weight quantization use as 4,2,1. 
//                  "4" leads to highest accuracy and orignal model size less the size lesser the accuracy



// configure parameters for detection.
const segmentationProperties = {
    flipHorizontal: true,
    internalResolution: 'high',
    segmentationThreshold: 0.9,
    scoreThreshold: 0.2
  };

// flipHorizontal        --> This should be set to true for videos where the video is by default flipped horizontally (i.e. a webcam),
//                          and you want the segmentation & pose to be returned in the proper orientation
// internalResolution    --> The larger the internalResolution the more accurate the model at the cost of slower prediction times. 
//                          Available values are low, medium, high, full
// segmentationThreshold --> The model estimates a score between 0 and 1 that indicates how confident it is that part of a person is displayed in that pixel.
//                          In essence, a higher value will create a tighter crop around a person.
// scoreThreshold        --> For pose estimation, only return individual person detections that have root part score greater or equal to this value.

function processSegmentation(canvas, segmentation) {
  var ctx = canvas.getContext('2d');
  console.log(segmentation)

  // Get data from our overlay canvas which is attempting to estimate background.
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;
  
  // Get data from the live webcam view which has all data.
  var liveData = videoRenderCanvasCtx.getImageData(0, 0, canvas.width, canvas.height);
  var dataL = liveData.data; 
  var minX = 100000;
  var minY = 100000;
  var maxX = 0;
  var maxY = 0;
  
  var foundBody = false;
  
  // Go through pixels and figure out bounding box of body pixels.
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      let n = y * canvas.width + x;
      
      // Human pixel found. Update bounds.
      if (segmentation.data[n] !== 0) {
        if(x < minX) {
          minX = x;
        }
        
        if(y < minY) {
          minY = y;
        }
        
        if(x > maxX) {
          maxX = x;
        }
        
        if(y > maxY) {
          maxY = y;
        }
        foundBody = true;
      }
    } 
  }
  
  // Calculating dimensions of bounding box.
  var width = maxX - minX;
  var height = maxY - minY;
  
  // Defining scale factor to use in case of false negatives around this region.
  var scale = 1.3;

  //  Defining scaled dimensions.
  var newWidth = width * scale;
  var newHeight = height * scale;

  // Caculating the offset to place new bounding box so scaled from center of current bounding box.
  var offsetX = (newWidth - width) / 2;
  var offsetY = (newHeight - height) / 2;

  var newXMin = minX - offsetX;
  var newYMin = minY - offsetY;
  
  
  // Now loop through update backgound understanding with new data
  // if not inside a bounding box.
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      
      // If outside the bounding box we found a body, update background.
      if (foundBody && (x < newXMin || x > newXMin + newWidth) || ( y < newYMin || y > newYMin + newHeight)) {
        // Convert xy coordinatess to offset of arrays.
        let n = y * canvas.width + x;

        data[n * 4] = dataL[n * 4];
        data[n * 4 + 1] = dataL[n * 4 + 1];
        data[n * 4 + 2] = dataL[n * 4 + 2];
        data[n * 4 + 3] = 255;            

      } else if (!foundBody) {

        //if no body found at all, update all the pixels.
        let n = y * canvas.width + x;
        data[n * 4] = dataL[n * 4];
        data[n * 4 + 1] = dataL[n * 4 + 1];
        data[n * 4 + 2] = dataL[n * 4 + 2];
        data[n * 4 + 3] = 255;    
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  
  if (DEBUG) {
    ctx.strokeStyle = "#00FF00"
    ctx.beginPath();
    ctx.rect(newXMin, newYMin, newWidth, newHeight);
    ctx.stroke();
  }
}




// Loading the model with our parameters defined above.
// Before the use of bodypix class we must wait for it to finish
// loading because Machine Learning models can be large and take a moment to
// get every parameter needed for its working.
var modelHasLoaded = false;
var model = undefined;

model = bodyPix.load(bodyPixProperties).then(function (loadedModel) {
  model = loadedModel;
  modelHasLoaded = true;

  // Showing that demo section when the model is ready to use.
  demosSection.classList.remove('invisible');
});

// just like lr = LinearRegression(), we have our model with bodyPix attributes




// ********************************************************************
//      Continuously grab image from webcam stream and classify it.
// ********************************************************************

var previousSegmentationComplete = true;



// This function will be called repeatedly itself when the browser is ready to process
// the next frame from webcam.
function predictWebcam() {
  if (previousSegmentationComplete) {
    // Copy the video frame from webcam to a tempory canvas not in the DOM but to the Memory.
    videoRenderCanvasCtx.drawImage(video, 0, 0);
    previousSegmentationComplete = false;

    // Now classifying the canvas image we have available.
    // Multiple people in the image get merged into a single binary mask. 
    // In addition to attributes like width, height, and data fields, it returns a field allPoses which contains poses for all people.
    model.segmentPerson(videoRenderCanvas, segmentationProperties).then(function(segmentation) {
      // webCanvas is the object defined in Canvas 2D API which is passed in the function below
      // we got the segmentation object from the bodypix segmentPerson function which has the required data fields of the person
      processSegmentation(webcamCanvas, segmentation); // this function is defined above
      previousSegmentationComplete = true;
    });
  }

  // Call this function again to keep predicting when the browser is ready.
  // The window.requestAnimationFrame() method tells the browser that you wish 
  // to perform an animation and requests that the browser calls a specified function
  // to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
  window.requestAnimationFrame(predictWebcam);
}



// It will used to temporarily hold the video frames during classification
// of the image on each frame
var videoRenderCanvas = document.createElement('canvas');

// getContext() returns an object that provides methods and properties for drawing on the canvas.
var videoRenderCanvasCtx = videoRenderCanvas.getContext('2d');



var webcamCanvas = document.createElement('canvas');  //it will show output frames after removing the preson
webcamCanvas.setAttribute('class', 'overlay');  //overlay value is set for class attribute of webcamCanvas element which will then bee super imposed

// LiveView --> The video element is going to display the live video from the webcam 
// which would be then used to process the frames through the BodyPix model.
liveView.appendChild(webcamCanvas); // appendChild() method appends a node as the last child of a node

// var bodyPixCanvas = document.createElement('canvas');
// bodyPixCanvas.setAttribute('class', 'overlay');
// var bodyPixCanvasCtx = bodyPixCanvas.getContext('2d');
// bodyPixCanvasCtx.fillStyle = '#FF0000';

// liveView.appendChild(bodyPixCanvas);




// Enable the live webcam view and start classification.
function enableCam(event) {

  // If the BodyPix model is not loaded, then exit from the function.
  if (!modelHasLoaded) {
    return;
  }

  // “Enable Webcam” button is hid after it is clicked once 
  // as the video will start playing and classification will be done continuously on the live feed.
  event.target.classList.add('removed'); 

  const constraints = {
    //parameters that will be passed to the getUserMedia() function. Since for this app, we only require the video feed, the video parameter alone is set to “true”.
    video: true 
  };

  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) { //activate webcam stream
    video.addEventListener('loadedmetadata', function() { // metadata for video consist of dimensions
                                                          // which is being loaded to loadedmetadata event
      
      // Update widths and heights once video is successfully played   
      // otherwise it will have width and height of zero initially causing 
      // classification to fail.
      webcamCanvas.width = video.videoWidth;
      webcamCanvas.height = video.videoHeight;
      videoRenderCanvas.width = video.videoWidth;
      videoRenderCanvas.height = video.videoHeight;
      // bodyPixCanvas.width = video.videoWidth;
      // bodyPixCanvas.height = video.videoHeight; 
      
      let webcamCanvasCtx = webcamCanvas.getContext('2d');
      // Displaying the first frame of the video in the “webcamCanvas” which will be displayed below the live video on the screen.
      webcamCanvasCtx.drawImage(video, 0, 0);
    }); 

    // Assigning the video stream as the source for the video element.
    // Live view from the webcam will then be displayed on the screen.
    video.srcObject = stream;
    
    // The loadeddata event occurs when data for the current frame is loaded, 
    // but not enough data to play next frame of the specified audio/video.
    video.addEventListener('loadeddata', predictWebcam); // targets next frame for segmentation
  });
}









// Funciton to check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}
//  The JavaScript navigator object is used for browser detection and 
//   navigator.mediaDevices.getUserMedia prompts user to allow th requested media device

if (hasGetUserMedia()) {
  const enableWebcamButton = document.getElementById('webcamButton');
  enableWebcamButton.addEventListener('click', enableCam);//if webcam access is aquired then add event listener to the element 
  //An event listener is a procedure or function in a computer program that waits for an event to occur.
} else {
  console.warn('getUserMedia() is not supported by your browser');
}