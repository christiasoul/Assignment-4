/////////////////////////////////////////////////////////////////////////////
//
//  Solar.js
//
/////////////////////////////////////////////////////////////////////////////

"use strict";

//---------------------------------------------------------------------------
//
//  Declare our "global" variables, including the array of planets (each of
//    which is a sphere)
//

var canvas = undefined;
var gl = undefined;

// The list of planets to render.  Uncomment any planets that you are 
// including in the scene For each planet in this list, make sure to 
// set its distance from the sun, as well its size and colors 
var Planets = {
  Sun : new Sphere(),
  Mercury : new Sphere(),
  Venus : new Sphere(),
  Earth : new Sphere(),
  Moon : new Sphere(),
  Mars : new Sphere(),
  // Jupiter : new Sphere(),
  // Saturn : new Sphere(),
  // Uranus : new Sphere(),
  // Neptune : new Sphere(),
  // Pluto : new Sphere()
};

var MercuryTime = 87.969;
var VenusTime = 224.701
var EarthTime = 365.256;
var MoonTime = 27.32;
var MarsTime = 686.97;

// Viewing transformation parameters
var V = undefined;  // matrix storing the viewing transformation

// Projection transformation parameters
var P = undefined;  // matrix storing the projection transformation
var near = 10;      // near clipping plane's distance
var far = 120;      // far clipping plane's distance

// Animation variables
var time = 0.0;      // time, our global time constant, which is 
                     // incremented every frame
var timeDelta = 0.5; // the amount that time is updated each fraime

// An angular velocity that could be applied to 
var angularVelocity = Math.PI / 10;

//---------------------------------------------------------------------------
//
//  init() - scene initialization function
//

function init() {
  canvas = document.getElementById("webgl-canvas");

  // Configure our WebGL environment
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL initialization failed"); }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Initialize the planets in the Planets list, including specifying
  // necesasry shaders, shader uniform variables, and other initialization
  // parameters.  This loops adds additinoal properties to each object
  // in the Planets object;
  for (var name in Planets ) {
    
    var p = Planets[name];

    p.vertexShader = "Planet-vertex-shader";
    p.fragmentShader = "Planet-fragment-shader";

    p.init(18,8); 

    p.uniforms = { 
      color : gl.getUniformLocation(p.program, "color"),
      MV : gl.getUniformLocation(p.program, "MV"),
      P : gl.getUniformLocation(p.program, "P"),
	  texture : initTexture(),
    };
  }
  
  
  resize();

  window.requestAnimationFrame(render);  
}

function initTexture () { 
  var texture = gl.createTexture();
  var texImage = new Image();
  texImage.onload = function () {
	  loadTexture(texImage, texture);
  };
  texImage.src = "http://i.imgur.com/dGGCI6X.jpg"; // WebGL will not load this image into a texture for some reason
}

function loadTexture(image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
    gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D,
    gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null); }
//---------------------------------------------------------------------------
//
//  render() - render the scene
//

function render() {
  time += timeDelta;

  var ms = new MatrixStack();

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Specify the viewing transformation, and use it to initialize the 
  // matrix stack
  V = translate(0.0, 0.0, -0.5*(near + far));
  ms.load(V);  

  // Note: You may want to find a way to use this value in your
  //  application
  var angle = time * angularVelocity;

  //
  // Render the Sun.  Here we create a temporary variable to make it
  //  simpler to work with the various properties.
  //
	
  var Sun = Planets.Sun;
  var radius = SolarSystem.Sun.radius;
  var color = SolarSystem.Sun.color;

  ms.push();
  ms.scale(radius);
  gl.useProgram(Sun.program);
  gl.uniformMatrix4fv(Sun.uniforms.MV, false, flatten(ms.current()));
  gl.uniformMatrix4fv(Sun.uniforms.P, false, flatten(P));
  gl.uniform4fv(Sun.uniforms.color, flatten(color));
  Sun.draw();
  ms.pop();
	
  //
  //  Add your code for more planets here!
  //
  var Mercury = Planets.Mercury;
  var Venus = Planets.Venus;
  var Earth = Planets.Earth;
  var Moon = Planets.Moon;
  var Mars = Planets.Mars;
  var MercuryDist = [Math.cos(((time % MercuryTime) / (MercuryTime / 2) ) * Math.PI) * 20, Math.sin(((time % MercuryTime ) / (MercuryTime / 2) ) * Math.PI) * 20, 0]
  var VenusDist = [Math.cos(((time % VenusTime) / (VenusTime / 2) ) * Math.PI) * 40, Math.sin(((time % VenusTime ) / (VenusTime / 2) ) * Math.PI) * 45, 0]
  var EarthDist = [Math.cos(((time % EarthTime) / (EarthTime / 2) ) * Math.PI) * 55, Math.sin(((time % EarthTime ) / (EarthTime / 2) ) * Math.PI) * 55, 0]
  var MoonDist = [Math.cos(((time % MoonTime) / (MoonTime / 2) ) * Math.PI) * 5, Math.sin(((time % MoonTime ) / (MoonTime / 2) ) * Math.PI) * 5, 0]
  var MarsDist = [Math.cos(((time % MarsTime) / (MarsTime / 2) ) * Math.PI) * 80, Math.sin(((time % MarsTime ) / (MarsTime / 2) ) * Math.PI) * 80, 0]
  
  radius = SolarSystem.Mercury.radius;
  color = SolarSystem.Mercury.color;
  
  
  
  
  ms.push();
  
  
  
  ms.translate(MercuryDist);
  ms.scale(radius);
  gl.useProgram(Mercury.program);
  gl.uniformMatrix4fv(Mercury.uniforms.MV, false, flatten(ms.current()));
  gl.uniformMatrix4fv(Mercury.uniforms.P, false, flatten(P));
  gl.uniform4fv(Mercury.uniforms.color, flatten(color));
  Mercury.draw();
  ms.pop();
  
  
  var scaling = [1 + Math.abs(Math.sin(((time % VenusTime ) / (VenusTime / 2) ) * Math.PI) * .15), 1 + Math.abs(Math.cos(((time % VenusTime ) / (VenusTime / 2) ) * Math.PI) * .15), 1]
  radius = SolarSystem.Venus.radius;
  color = SolarSystem.Venus.color;
  
  ms.push();
  
  ms.translate(VenusDist);
  ms.scale(radius);
  ms.scale(scaling);
  gl.useProgram(Venus.program);
  gl.uniformMatrix4fv(Venus.uniforms.MV, false, flatten(ms.current()));
  gl.uniformMatrix4fv(Venus.uniforms.P, false, flatten(P));
  gl.uniform4fv(Venus.uniforms.color, flatten(color));
  Venus.draw();
  ms.pop();
  
  
  radius = SolarSystem.Earth.radius;
  color = SolarSystem.Earth.color;
  
  scaling = [1 + Math.abs(Math.sin(((time % EarthTime ) / (EarthTime / 2) ) * Math.PI) * .4), 1 + Math.abs(Math.cos(((time % EarthTime ) / (EarthTime / 2) ) * Math.PI) * .4), 1]
  
  ms.push();
  
  ms.translate(EarthDist);
  ms.scale(radius);
  ms.scale(scaling);
  gl.useProgram(Earth.program);
  gl.uniformMatrix4fv(Earth.uniforms.MV, false, flatten(ms.current()));
  gl.uniformMatrix4fv(Earth.uniforms.P, false, flatten(P));
  gl.uniform4fv(Earth.uniforms.color, flatten(color));
  Earth.draw();
  ms.pop();
  
  // Moon
  
  radius = SolarSystem.Moon.radius;
  color = SolarSystem.Moon.color;
  
  ms.push();
  
  ms.translate(MoonDist);
  ms.translate(EarthDist)
  
  ms.scale(radius);
  ms.scale(scaling);
  gl.useProgram(Moon.program);
  gl.uniformMatrix4fv(Moon.uniforms.MV, false, flatten(ms.current()));
  gl.uniformMatrix4fv(Moon.uniforms.P, false, flatten(P));
  gl.uniform4fv(Moon.uniforms.color, flatten(color));
  Moon.draw();
  ms.pop();
  
  
  radius = SolarSystem.Mars.radius;
  color = SolarSystem.Mars.color;
  
  scaling = [1 + Math.abs(Math.sin(((time % MarsTime ) / (MarsTime / 2) ) * Math.PI) * .6), 1 + Math.abs(Math.cos(((time % MarsTime ) / (MarsTime / 2) ) * Math.PI) * .6), 1]
  
  ms.push();
  
  ms.translate(MarsDist);
  ms.scale(radius);
  ms.scale(scaling);
  gl.useProgram(Mars.program);
  gl.uniformMatrix4fv(Mars.uniforms.MV, false, flatten(ms.current()));
  gl.uniformMatrix4fv(Mars.uniforms.P, false, flatten(P));
  gl.uniform4fv(Mars.uniforms.color, flatten(color));
  Mars.draw();
  ms.pop();
  

  window.requestAnimationFrame(render);
}

//---------------------------------------------------------------------------
//
//  resize() - handle resize events
//

function resize() {
  var w = canvas.clientWidth;
  var h = canvas.clientHeight;

  gl.viewport(0, 0, w, h);

  var fovy = 120.0; // degrees
  var aspect = w / h;

  P = perspective(fovy, aspect, near, far);
}

//---------------------------------------------------------------------------
//
//  Window callbacks for processing various events
//

window.onload = init;
window.onresize = resize;