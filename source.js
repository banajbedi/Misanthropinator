// 
// @author : 
//             Banaj Bedi
//             Chandan Kansal 
// 


const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const DEBUG = true;

// If you are planning on debugging your application, 
// you'll generally want the debug attribute to be set to "true". 
// If you are planning on compiling your application for release (i.e. being actually released and deployed), 
// it's generally better to not have the debug attribute (or have it set to false).
// Disabling the debug option will allow the compiler to take advantage of various performance tweaks 
// since it won't need to worry about any possibly debugging and it can build a more optimized application.


// configure parameters to set for the bodypix model.
const bodyPixProperties = {
    architecture: 'ResNet',
    outputStride: 16,
    quantBytes: 4
  };

// Architecture  -> Can be either MobileNetV1 or ResNet50.
// Output stride -> Can be for MobileNetV1(8,16) and for ResNet(16,32) The smaller the value, the larger the output resolution,
//                  and more accurate the model at the cost of speed.
// Multiplier    -> Only used by MobileNetV1 architecture can be 1.00 0.75 or 0.50
// Quant bytes   -> This argument controls the bytes used for weight quantization use as 4,2,1. 
//                  "4" leads to highest accuracy and orignal model size less the size lesser the accuracy



// configure parameters for detection.
const segmentationProperties = {
    flipHorizontal: true,
    internalResolution: 'high',
    segmentationThreshold: 0.9,
    scoreThreshold: 0.2
  };

// flipHorizontal        -> This should be set to true for videos where the video is by default flipped horizontally (i.e. a webcam),
//                          and you want the segmentation & pose to be returned in the proper orientation
// internalResolution    -> The larger the internalResolution the more accurate the model at the cost of slower prediction times. 
//                          Available values are low, medium, high, full
// segmentationThreshold -> The model estimates a score between 0 and 1 that indicates how confident it is that part of a person is displayed in that pixel.
//                          In essence, a higher value will create a tighter crop around a person.
// scoreThreshold        -> For pose estimation, only return individual person detections that have root part score greater or equal to this value.

function processSegmentation(canvas, segmentation) {

  // getContext() function returns a drawing context on the canvas, or null if the context identifier is not supported
  var ctx = canvas.getContext('2d');
  console.log(segmentation) // prints the segmentation onto console

  // Get data from our overlay canvas which is attempting to estimate background.
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);  //store ctx to variable named imagedata starting from 0,0 to canvas width, canvas height
  var data = imageData.data;  //assigning the pixel data of variable imageData to variable named Data
}




// Loading the model with our parameters defined above.
// Before we can use bodypix class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
var modelHasLoaded = false;
var model = undefined;

model = bodyPix.load(bodyPixProperties).then(function (loadedModel) {
  model = loadedModel;
  modelHasLoaded = true;

  // Showing that demo section now model is ready to use.
  demosSection.classList.remove('invisible');
});

// just like lr = LinearRegression(), we have model with bodyPix attributes




// ********************************************************************
//      Continuously grab image from webcam stream and classify it.
// ********************************************************************

var previousSegmentationComplete = true;



// This function will repeatedly call itself when the browser is ready to process
// the next frame from webcam.
function predictWebcam() {
  if (previousSegmentationComplete) {
    // Copy the video frame from webcam to a tempory canvas in memory only (not in the DOM).
    videoRenderCanvasCtx.drawImage(video, 0, 0);
    previousSegmentationComplete = false;

    // Now classify the canvas image we have available.
    // Multiple people in the image get merged into a single binary mask. 
    // In addition to width, height, and data fields, it returns a field allPoses which contains poses for all people.
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




// Enable the live webcam view and start classification.
function enableCam(event) {

  // If the BodyPix model is not loaded, then exit from the function.
  if (!modelHasLoaded) {
    return;
  }

  // “Enable Webcam” button is hid after it is clicked once 
  // as the video will start playing and classification will be done continuously on the live feed.
  event.target.classList.add('removed'); 

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