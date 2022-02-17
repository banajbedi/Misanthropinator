// 
// @author : 
//             Banaj Bedi
//             Chandan Kansal 
// 


const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const DEBUG = false;

// If you are planning on debugging your application, 
// you'll generally want the debug attribute to be set to "true". 
// If you are planning on compiling your application for release (i.e. being actually released and deployed), 
// it's generally better to not have the debug attribute (or have it set to false).
// Disabling the debug option will allow the compiler to take advantage of various performance tweaks 
// since it won't need to worry about any possibly debugging and it can build a more optimized application.

const bodyPixProperties = {
    architecture: 'ResNet',
    outputStride: 16,
    quantBytes: 4
  };

//architecture - Can be either MobileNetV1 or ResNet50.
//output stride can be for MobileNetV1(8,16) and for ResNet(16,32) The smaller the value, the larger the output resolution, and more accurate the model at the cost of speed.
//multiplier only used by MobileNetV1 architecture can be 1.00 0.75 or 0.50
//quant bytes  This argument controls the bytes used for weight quantization use as 4,2,1 .4 leads to highest accuracy and orignal model size less the size lesser the accuracy