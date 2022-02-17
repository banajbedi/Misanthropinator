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
