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